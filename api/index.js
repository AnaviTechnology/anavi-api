var express = require('express');
var app = express();

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var fs = require('fs');
var nconf = require('nconf');
var mysql = require('mysql');

var configFile = __dirname+'/config.json';
try {
  configFile = argConfigFile();
}
catch (error) {
  console.log(error.message);
}
try {
  fs.statSync(configFile);
  nconf.file(configFile);
  if (undefined === nconf.get('mqtt:broker')) {
    throw "MQTT broker not defined";
  }
} catch(error) {
  if (error && error.code && ('ENOENT' === error.code) ) {
    console.log('Unable to open configuration file: '+configFile);
  }
  else if (typeof error === 'string') {
    console.log(error);
  }
  process.exit(1);
}
nconf.file(configFile);

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'rabbit iot', resave: false, saveUninitialized: false }));
var bodyParser = require("body-parser");
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));

var mqtt = require('mqtt');
var mqttClient = mqtt.connect('mqtt://'+nconf.get('mqtt:broker'));

var databaseConnection = mysql.createConnection({
  host     : nconf.get('database:host'),
  user     : nconf.get('database:user'),
  password : nconf.get('database:password'),
  database : nconf.get('database:name')
});

passport.use(new Strategy(
  function(username, password, cb) {

    var sql = 'SELECT user_id, user_email, user_display_name, ';
    sql += 'user_display_surname FROM users ';
    sql += 'WHERE user_username = ? AND user_password = SHA1( ? ) LIMIT 1;';

    databaseConnection.query(sql, [username, password], function(err, rows, fields) {
      if (err) { return cb(err); }
      if (0 === rows.length) { return cb(null, false); }
      var user = {
                  id: rows[0].user_email,
                  userId: rows[0].user_id,
                  username: username,
                  password: '',
                  displayName: rows[0].user_display_name,
                  displaySurname: rows[0].user_display_surname,
                  emails: [ { value: rows[0].user_email } ]
      }
      return cb(null, user);
    });
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {

  var sql = 'SELECT user_id, user_username, user_display_name, ';
  sql += 'user_display_surname FROM users WHERE user_email = ? LIMIT 1;';

  databaseConnection.query(sql, [id], function(err, rows, fields) {
    if (err) { return cb(err); }
    if (0 === rows.length) { return cb(null, false); }
    var user = {
                id: rows[0].user_id,
                username: rows[0].user_username,
                password: '',
                displayName: rows[0].user_display_name,
                displaySurname: rows[0].user_display_surname,
                emails: [ { value: id } ]
    }
    return cb(null, user);
  });
});

var gatekeeper = {
  ensureLoggedIn : function() {
    return function(req, res, next) {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).send('401 Unauthorized');
      }
      else{
        next();
      }
    }
  }
}

function argConfigFile() {
  for(var iter=0; iter < process.argv.length; iter++) {
    if ( ("-c" === process.argv[iter]) || ("--config" === process.argv[iter]) ) {
      var next = iter+1;
      if ( (next <= process.argv.length) && (undefined !== process.argv[next]) ) {
        return process.argv[next];
      }
      break;
    }
  }
  //Configuration files has not been found so throw an exception
  throw new Error('Using the default configuration file.');
}

function dashboard(req, res) {
  var data = {
    devices: {
      all: 3,
      connected: 2
    }
  }
  res.json(data);
}

function places(req, res) {
  var data = [
    {
      id: 1,
      name: "home"
    },
    {
      id: 2,
      name: "office"
    }
  ];
  res.json(data);
}

function place(req, res) {
  var placeId = req.param('id');
  var data = {
    id: placeId,
    devices: [
      {
        id: 1,
        name: "foo"
      },
      {
        id: 2,
        name: "bar"
      }
    ]
  };

  res.json(data);
}

function devices(req, res) {
  var data = {
    devices: [
      {
        id: 1,
        name: "foo",
        power: true
      },
      {
        id: 2,
        name: "bar",
        power: false
      }]
  };

  res.json(data);
}

function device(req, res) {
  var deviceId = req.param('id');
  var data = {
    id: deviceId,
    name: 'Power switch A',
    type: 'Power Switch',
    power: true,
    features: ["Turn on/off", "Еlectric meter"]
  };

  res.json(data);
}

function deviceCommand(req, res) {
  var deviceId = req.param('id');
  var deviceCommand = req.param('command');
  if ('power' !== deviceCommand) {
    res.status(501).send('501 Not Implemented');
    return;
  }
  var devicePower = ('true' == req.param('key')) ? true : false;

  //Send command to the device using MQTT
  var topic = 'device/'+deviceId;
  var message = '{ "power": '+devicePower+' }';
  console.log('topic: '+topic+' message: '+message);
  mqttClient.publish(topic, message );

  var data = {
    id: deviceId,
    power: devicePower
  };

  res.json(data);
}

function groups(req, res) {
  var data = {
    groups: [
      {
        id: 1,
        name: "Lights"
      },
      {
        id: 2,
        name: "Fans"
      },
      {
        id: 3,
        name: "Doors"
      },]
  };

  res.json(data);
}

function userLogout(req, res) {
  req.logout();
  var data = {
                errorCode: 0,
                errorMessage: ''
            };
  res.json(data);
}

function retrieveSettings(userId, callback) {
  //default values
  var settings = {
    home: "pageDevices"
  }

  var sql = 'SELECT settings_type, settings_value ';
  sql += 'FROM settings WHERE settings_user_id = ?';

  databaseConnection.query(sql, [userId], function(err, rows, fields) {
    if (err) { return callback(settings); }
    for (var index=0; index<rows.length; index++) {
      settings[rows[index].settings_type] = rows[index].settings_value;
    }
    return callback(settings);
  });
}

function loginSuccess(req, res) {
  retrieveSettings(req.user.userId, function(settingsData) {
    var data = {
      user: {
        name: req.user.displayName,
        surname: req.user.displaySurname
      },
      settings: settingsData
    }
    res.json(data);
  });
}

function settingsLoad(req, res) {
  retrieveSettings(req.user.id, function(settingsData) {
    res.json(settingsData);
  });
}

function settingsSave(req, res) {
  var homePage = req.body.settingsHomePage;
  //TODO: save home page
  console.log('Save home page: '+homePage);
  retrieveSettings(req.user.id, function(settingsData) {
    res.json(settingsData);
  });
}

//API version
var apiVersion1 = express.Router();

apiVersion1.get('/dashboard', gatekeeper.ensureLoggedIn(), dashboard);
apiVersion1.get('/places', gatekeeper.ensureLoggedIn(), places);
apiVersion1.get('/place/:id', gatekeeper.ensureLoggedIn(), place);
apiVersion1.get('/devices', gatekeeper.ensureLoggedIn(), devices);
apiVersion1.get('/device/:id', gatekeeper.ensureLoggedIn(), device);
apiVersion1.get('/device/:id/:command/:key*', gatekeeper.ensureLoggedIn(), deviceCommand);
apiVersion1.get('/device/:id/:command*', gatekeeper.ensureLoggedIn(), deviceCommand);
apiVersion1.get('/groups', gatekeeper.ensureLoggedIn(), groups);
apiVersion1.get('/settings', gatekeeper.ensureLoggedIn(), settingsLoad);
apiVersion1.post('/settings/save', gatekeeper.ensureLoggedIn(), settingsSave);
apiVersion1.get('/logout', gatekeeper.ensureLoggedIn(), userLogout);

apiVersion1.post('/login', passport.authenticate('local'), loginSuccess);

// Routing depending the version of the API
app.use('/api/v1', apiVersion1);
// Set the default version to latest.
app.use('/api', apiVersion1);
//serve static HTML5 files
app.use('/', express.static(__dirname + '/../ui'));


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

//so the program will not close instantly
process.stdin.resume();

function exitHandler(options, err) {
  databaseConnection.end();
  if (options.cleanup) console.log('database closed.');
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

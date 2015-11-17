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

  //Retieve current values for devices in an organizations
  var sql = 'SELECT device_id, device_name, feature_name, dp_property ';
  sql += 'FROM organizations_devices ';
  sql += 'LEFT JOIN devices ON device_id = od_device_id ';
  sql += 'LEFT JOIN device_type_features ON dtf_type_id = devices.device_type_id ';
  sql += 'LEFT JOIN features ON dtf_feature_id = feature_id ';
  sql += 'LEFT JOIN device_properties ON device_id = dp_device_id AND feature_id = dp_feature_id ';
  sql += 'LEFT JOIN organizations_users ON od_organization_id = ou_organization_id  ';
  sql += 'WHERE ou_user_id = ?; ';

  databaseConnection.query(sql, [req.user.id], function(err, rows, fields) {

    //Create array of objects
    var devices = Array();
    for (var index=0; index<rows.length; index++) {
      var row = rows[index];
      if (typeof devices[row['device_id']] !== 'object') {
        //Each device is represented as an object
        devices[row['device_id']] = Object();
        devices[row['device_id']].id = row['device_id'];
        devices[row['device_id']].name = row['device_name'];
      }
      devices[row['device_id']][row['feature_name']] = row['dp_property'];
    }

    var data = {
      devices: []
    }

    //Convert associative array to numeric array
    devices.forEach(function(device) {
      data.devices.push(device);
    });
    //Serialize data and provide HTTP response
    res.json(data);
  });
}

function device(req, res) {
  var deviceId = req.param('id');

  //check if user has access to the device
  var sql = 'SELECT COUNT(*) AS count FROM organizations_devices ';
  sql += 'LEFT JOIN organizations_users ON od_organization_id = ou_organization_id ';
  sql += 'WHERE od_device_id = ? and ou_user_id = ?';

  databaseConnection.query(sql, [deviceId, req.user.id], function(err, rows, fields) {
    if ( (0 < rows.length) && (0 === rows[0]['count']) ) {
      res.status(403).send('403 Forbidden');
      return;
    }

    //Retrieve device type and name
    var sql = 'SELECT device_name, device_type, devices.device_type_id ';
    sql += 'FROM devices ';
    sql += 'LEFT JOIN device_types ';
    sql += 'ON devices.device_type_id = device_types.device_type_id ';
    sql += 'WHERE device_id = ? LIMIT 1';

    var data = {
      id: deviceId,
      name: '',
      type: '',
      features: [],
      properties: {}
    }

    databaseConnection.query(sql, [deviceId], function(err, rows, fields) {
      if (0 === rows.length) {
        res.status(404).send('404 Not Found');
        return;
      }

      data.name = rows[0]['device_name'];
      data.type = rows[0]['device_type'];

      var deviceTypeId = rows[0]['device_type_id'];

      //retrieve data
      var sql = 'SELECT feature_name, dp_property FROM device_properties ';
      sql += 'LEFT JOIN features ON feature_id = dp_feature_id ';
      sql += 'WHERE dp_device_id = ?';
      databaseConnection.query(sql, [deviceId], function(err, rows, fields) {
        for (var index=0; index<rows.length; index++) {
          var row = rows[index];
          data.properties[row['feature_name']] = row['dp_property'];
        }

        //retrieve all features per device
        var sql = 'SELECT feature_name, feature_unit FROM device_type_features ';
        sql += 'LEFT JOIN features ON dtf_feature_id = feature_id ';
        sql += 'WHERE dtf_type_id = 1;';
        databaseConnection.query(sql, [deviceTypeId], function(err, rows, fields) {

          rows.forEach(function(row) {
            data.features.push( { type: row['feature_name'],
                                  unit: row['feature_unit'] } );
          });
          res.json(data);
        });
      });
    });
  });
}

function deviceCommand(req, res) {
  var deviceId = req.param('id');
  var deviceCommand = req.param('command');
  if ('power' !== deviceCommand) {
    res.status(501).send('501 Not Implemented');
    return;
  }
  var devicePower = ('true' == req.param('key'));

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

function saveSettings(userId, data, callback) {

  var sql = 'REPLACE INTO settings ';
  sql += '(settings_user_id, settings_type, settings_value) VALUES ';
  sql += '(?, ?, ?)';

  databaseConnection.query(sql, [userId, 'home', data.settingsHomePage], function(err, rows, fields) {
    return callback(userId);
  });
}

function organizationsFind(userId, callback) {
  var sql = 'SELECT organization_name FROM organizations_users ';
  sql += 'LEFT JOIN organizations ON organization_id = ou_organization_id ';
  sql += 'WHERE ou_user_id = ?';

  console.log(sql);

  databaseConnection.query(sql, [userId], function(err, rows, fields) {
    var organizations = [];
    if (err) { return callback(organizations); }
    for (var index=0; index<rows.length; index++) {
      organizations.push(rows[index].organization_name);
    }
    return callback(organizations);
  });
}

function organizations(req, res) {
  organizationsFind(req.user.id, function(organizations) {
    var data = {
      "organizations": organizations
    }
    res.json(data);
  });
}

function organizationAdd(req, res) {
  var data = {
                errorCode: 0,
                errorMessage: ''
            };
  res.json(data);
}

function organizationUpdate(req, res) {
  var data = {
                errorCode: 0,
                errorMessage: ''
            };
  res.json(data);
}

function loginSuccess(req, res) {
  //Retrieve user's settings and organizations
  retrieveSettings(req.user.userId, function(settingsData) {
    var data = {
      user: {
        name: req.user.displayName,
        surname: req.user.displaySurname
      },
      settings: settingsData
    }

    organizationsFind(req.user.userId, function(organizations) {
      data.organizations = organizations;
      res.json(data);
    });

  });
}

function settingsLoad(req, res) {
  retrieveSettings(req.user.id, function(settingsData) {
    res.json(settingsData);
  });
}

function settingsSave(req, res) {
  saveSettings(req.user.id, req.body, function(userId) {
    retrieveSettings(req.user.id, function(settingsData) {
      res.json(settingsData);
    });
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
apiVersion1.get('/organizations', gatekeeper.ensureLoggedIn(), organizations);
apiVersion1.get('/organization/add', gatekeeper.ensureLoggedIn(), organizationAdd);
apiVersion1.get('/organization/update', gatekeeper.ensureLoggedIn(), organizationUpdate);
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

var express = require('express');
var app = express();

var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var db = require('./db');

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
}));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
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
  //TODO: integration with MQTT 
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

// Routing depending the version of the API
app.use('/api/v1', apiVersion1);
// Set the default version to latest.
app.use('/api', apiVersion1);
//serve static HTML5 files
app.use('/', express.static(__dirname + '/../ui'));

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ error: 0, errorCode: 0 }));
  });

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

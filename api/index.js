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
        name: "foo"
      },
      {
        id: 2,
        name: "bar"
      }]
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

apiVersion1.get('/dashboard', dashboard);
apiVersion1.get('/places', places);
apiVersion1.get('/place/:id*', place);
apiVersion1.get('/devices', devices);
apiVersion1.get('/groups', groups);

// Routing depending the version of the API
app.use('/api/v1', apiVersion1);
// Set the default version to latest.
app.use('/api', apiVersion1);
//serve static HTML5 files
app.use('/', express.static(__dirname + '/../ui'));

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ error: 0, errorCode: 0 }));
  });

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

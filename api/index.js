var express = require('express');
var app = express();

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
  var data = [
    {
      id: 1,
      name: "foo"
    },
    {
      id: 2,
      name: "bar"
    }
  ];
  res.json(data);
}

//API version
var apiVersion1 = express.Router();

apiVersion1.get('/dashboard', dashboard);
apiVersion1.get('/places', places);
apiVersion1.get('/place/:id*', place);
apiVersion1.get('/devices', devices);

// Routing depending the version of the API
app.use('/v1', apiVersion1);
// Set the default version to latest.
app.use('/', apiVersion1);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

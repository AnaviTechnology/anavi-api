var express = require('express');
var app = express();

app.get('/', function (req, res) {
  var data = new Object();
  data.foo = "bar";
  res.send(JSON.stringify(data));
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

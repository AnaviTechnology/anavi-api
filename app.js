var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello Jadja!');
});

var server = app.listen(8090, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Jadja-node listening at http://%s:%s', host, port);

});

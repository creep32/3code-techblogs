var express = require('express')
var http = require('http');
var app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// simple sum calculation
app.post('/sum', function (req, res) {
  console.log(req.body)
  const ret = require('./lib/sum')(req.body.a, req.body.b)
  res.json({result: ret})
})

var port = process.env.PORT || '3000';
app.set('port', port);

var server = http.createServer(app);
server.listen(port);
server.on('listening', onListening);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

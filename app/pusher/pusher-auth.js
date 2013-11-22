var express = require('express'),
  Pusher = require('pusher'), // jshint ignore:line
  app = express(),
  pusherConfig = require('./pusher-config'),
  pusher = new Pusher(pusherConfig);

app.use(express.bodyParser());

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );

  next();
});

app.post('/pusher/auth', function(req, res) {
  var socketId = req.body.socket_id,
    channel = req.body.channel_name,
    auth = pusher.auth(socketId, channel);

  res.send(auth);
});

module.exports = app;

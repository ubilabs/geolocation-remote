var express = require( 'express' );
var Pusher = require( 'pusher' );
var app = express( );

var pusherConfig = {
  appId: APP_ID,
  key: KEY,
  secret: secret
};

app.use( express.bodyParser() );

app.all('*', function(req, res, next) {

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Methods', 'POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  next();
});

var pusher = new Pusher( pusherConfig );

app.post( '/pusher/auth', function( req, res ) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  var auth = pusher.auth( socketId, channel );
  res.send( auth );
} );

module.exports = app;
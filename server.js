var io = require('socket.io').listen(8888);

io.sockets.on('connection', function (socket) {
  socket.join("room");

  socket.on('update', function (data) {
    io.sockets.in('room').emit('update', data);
  });
});
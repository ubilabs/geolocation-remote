var port = 8888,
  io = require('socket.io').listen(port),
  current;

io.sockets.on('connection', function (socket) {
  socket.join("room");

  socket.on('update', function (data) {
    io.sockets.in('room').emit('update', data);
    current = data;
  });

  if (current){
    socket.emit('update', current);
  }
});
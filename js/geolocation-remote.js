function geolocationRemote(socketUrl){

  var socket = io.connect(socketUrl),
    watchers = {},
    position,
    id = 0;

  // Listen for updates via the socket connection.
  socket.on('update', function (coords) {
    position = {
      coords: coords,
      timestamp: new Date()
    };

    updateWatchers();
  });

  // Send an update to all connected clients.
  function updatePosition (coords){
    socket.emit("update", coords);
  }

  // Execute all success handlers.
  function updateWatchers (){
    var watcher;

    for (var all in watchers){
      watcher = watchers[all];
      if (watcher.success){ watcher.success(position); }
    }
  }

  // Return the current position.
  // If no poisition is available it waits until the first update.
  function getCurrentPosition (success, error, options){
    if (position){
      success(position);
    } else {
      var id = watchPosition(function(){
        success(position);
        clearWatch(id);
      });
    }
  }

  // Watches all position updates.
  function watchPosition (success, error, options){
    watchers[++id] = { id: id, success: success, error: error };
    return id;
  }

  // Clears a watcher by it's id.
  function clearWatch (id){
    delete watchers[id];
  }

  // Return the public interface.
  return {
    updatePosition: updatePosition,
    getCurrentPosition: getCurrentPosition,
    watchPosition: watchPosition,
    clearWatch: clearWatch
  };
}
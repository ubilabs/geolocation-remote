function geolocationRemote(socketUrl){

  var socket = io.connect(socketUrl),
    position,
    watchers = {},
    id = 0;

  socket.on('update', onUpdate);

  function onUpdate (coords) {
    position = {
      coords: coords,
      timestamp: new Date()
    };

    updateWatchers();
  }

  function updateWatchers (){
    var watcher;

    for (var all in watchers){
      watcher = watchers[all];
      if (watcher.success){ watcher.success(position); }
    }
  }

  function updatePosition (coords){
    socket.emit("update", coords);
  }

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

  function watchPosition (success, error, options){
    watchers[++id] = { id: id, success: success, error: error };
    return id;
  }

  function clearWatch (id){
    delete watchers[id];
  }

  return {
    updatePosition: updatePosition,
    getCurrentPosition: getCurrentPosition,
    watchPosition: watchPosition,
    clearWatch: clearWatch
  };
}
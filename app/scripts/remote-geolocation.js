function geolocationRemote(socketUrl){

  // Set up our socket listening on socketUrl
  var socket = io.connect(socketUrl),
    // here we store our watchers (There is only one real watcher but if we call getCurrentPosition we create a new one so we need a place to store two watchers ...)
    watchers = [],
    // watcher ID
    id = 0,
    // Position data of the remote control
    position,
    // store the errorCode
    errorCode = -1;

  // what should we listen for? 
  // default is updateWebapp (called from remote control)
  // here is the entry point of our data from the remote control
  socket.on('update:webapp', function (data) {

    errorCode = data.error || errorCode;
    errorCode = parseInt(errorCode, 10);

    // let's update the watching webapp success callback
    // if we have position data and no error and no online value
    if (data.position && errorCode<0 && navigator.onLine) {
      position = {
        coords: data.position,
        timestamp: new Date().getTime()
      };

      updateWatchers();

    } else if (data.error) { // if there is an error defined we call the error callback
      onPositionError();
    }

    // set navigator onLine value to what ever we got from the remote
    // navigator.onLine should be checked by the webapp itself.
    if (typeof data.onLine != 'undefined') {
      navigator.onLine = data.onLine;
    }

  });

  socket.on("error", function(){
    console.log("error", arguments);
  });

  socket.on("disconnect", function(){
    alert("Socket disconnected");
  });

  // send Data to remote control.
  // Like starting point (where your webapp is located right now),
  // pois you use in your app an want to see on the map, etc. 
  function sendToRemote (data) {
    socket.emit("update:remote", data);
  }

  // called when we receive an error from the remote control
  // actually this is called when don't get any position data from the remote control
  function onPositionError (){
    var watcher;

    for (var all in watchers){

      watcher = watchers[all];

      if (watcher.error) {
        watcher.error({code: errorCode*1});
      }
    } 
  }

  // update watchers. Call the success callback of navigator.watchPosition()
  function updateWatchers (){
    var watcher;
    for (var all in watchers) {
      watcher = watchers[all];
      if (watcher.success){ watcher.success(position);}
    }
  }

  // call watch position with success and error callbacks. sometimes even with options
  function getCurrentPosition (success, error, options){
    if (position){
      success(position);
    } else {
      var id = watchPosition(function(){
        success(position);
        clearWatch(id);
      },
      function(){
        error(position);
        clearWatch(id);
      });
    }
  }

  // fake watchPosition() used to bind callbacks to our own navigator.geolocation functions
  function watchPosition (success, error, options){
    watchers[++id] = { id: id, success: success, error: error };
    return id;
  }

  function clearWatch (id){
    delete watchers[id];
  }

  return {
    getCurrentPosition: getCurrentPosition,
    watchPosition: watchPosition,
    clearWatch: clearWatch,
    sendToRemote: sendToRemote
  };
}
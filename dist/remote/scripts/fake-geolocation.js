function geolocationRemote(connect){

    // here we store our watchers (There is only one real watcher but if we call getCurrentPosition we create a new one so we need a place to store two watchers ...)
  var watchers = [],
    // watcher ID
    id = 0,
    // Position data of the remote control
    position,
    // store the errorCode
    errorCode = -1,
    // error messages of GPS errors
    errorMessages = {
      0: 'UNKNOWN_ERROR',
      1: 'PERMISSION_DENIED',
      2: 'POSITION_UNAVAILABLE',
      3: 'TIMEOUT'
    };

  if (connect === 'socket') {
    var pusher = new Pusher(remote.pusherConfig.KEY, {
      authEndpoint: remote.pusherConfig.authEndpoint
    });

    var channel = pusher.subscribe('private-remoteLocationManager');

    channel.bind('pusher:subscription_succeeded', onDataReceived);

    var listenChannel = pusher.subscribe('private-remoteLocationManager');

    listenChannel.bind('client-locationUpdate', function(data) {
      onDataReceived(data);
    });

  } else if (connect === 'iframe') {
    window.addEventListener("message", onDataReceived, false);
  }


  function sendToRemote (data) {
    if (connect === 'socket') {
      channel.trigger('client-locationUpdate', data);
    }

    if (connect === 'iframe') {
      data = {data: data};
      parent.postMessage(data, window.location.origin + '/remote');
    }
  }

  function onDataReceived(data) {
    if (connect === 'iframe') {
      data = data.data;
    }

    position = data.position;

    errorCode = data.error || errorCode;
    errorCode = parseInt(errorCode, 10);

    // set navigator onLine value to what ever we got from the remote
    // navigator.onLine should be checked by the webapp itself.
    if (typeof data.onLine != 'undefined') {
      navigator.onLine = data.onLine;
    }

    // let's update the watching webapp success callback
    // if we have position data and no error and no online value
    if (position && errorCode < 0) {
      updateWatchers();
    } else if (data.error) { // if there is an error defined we call the error callback
      onPositionError();
    }
  }

  // called when we receive an error from the remote control
  // actually this is called when don't get any position data from the remote control
  function onPositionError (){
    for (var watcher in watchers){

      watcher = watchers[watcher];

      if (watcher.error) {
        watcher.error({
          code: errorCode*1,
          message: errorMessages[errorCode]
        });
      }
    }
  }

  // update watchers. Call the success callback of navigator.watchPosition()
  function updateWatchers (){
    for (var watcher in watchers) {
      watcher = watchers[watcher];
      if (watcher.success){ watcher.success(position);}
    }
  }

  // call watch position with success and error callbacks. sometimes even with options
  function getCurrentPosition (success, error, options){
    if (position && errorCode < 0){
      success(position);
    } else {
      error({
        code: errorCode*1,
        message: errorMessages[errorCode]
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
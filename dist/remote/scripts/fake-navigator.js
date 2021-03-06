/**
 * Will overwrite the navigator object and
 * get the geoPosition from a Websocket.
 */
var connect = (window.self === window.top) ? 'socket' : 'iframe';

window.fakenavigator = {
  geolocation: geolocationRemote(connect),
  onLine: window.navigator.onLine
};

window.fakenavigator.geolocation.sendToRemote({
  init: true,
  connect: connect,
  log: 'Initialized fake navigator | ' + connect
});

/* jshint maxstatements:20 */
function geolocationRemote(connect) {
  // here we store our watchers (There is only one real watcher but
  // if we call getCurrentPosition we create a new one so we need
  // a place to store two watchers ...)
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
    },
    pusher, channel, listenChannel;

  if (connect === 'socket') {
    pusher = new Pusher(remote.pusherConfig.KEY, {
      authEndpoint: remote.pusherConfig.authEndpoint
    });

    channel = pusher.subscribe('private-remoteLocationManager');
    channel.bind('pusher:subscription_succeeded', onMessageReceived);

    listenChannel = pusher.subscribe('private-remoteLocationManager');
    listenChannel.bind('client-locationUpdate', onMessageReceived);
  } else if (connect === 'iframe') {
    window.addEventListener('message', onMessageReceived, false);
  }


  function sendToRemote(data) {
    if (connect === 'socket') {
      channel.trigger('client-locationUpdate', data);
    }

    if (connect === 'iframe') {
      parent.postMessage(data, window.location.origin + '/remote');
    }
  }

  function onMessageReceived(message) {
    if (!message.error && !message.position && !message.data) {
      return;
    }

    var data = (message.data) ? message.data : message;

    errorCode = data.error || errorCode;
    errorCode = parseInt(errorCode, 10);

    // set navigator onLine value to what ever we got from the remote
    // navigator.onLine should be checked by the webapp itself.
    if (typeof data.onLine != 'undefined') {
      window.fakenavigator.onLine = data.onLine;
    }

    // let's update the watching webapp success callback
    // if we have position data and no error and no online value
    if (data.position && errorCode < 0) {
      position = data.position;
      updateWatchers();
    } else if (data.error) {
      onPositionError();
    }
  }

  // called when we receive an error from the remote control
  // actually this is called when don't get any position data
  // from the remote control
  function onPositionError() {
    for (var watcher in watchers) {
      watcher = watchers[watcher];

      if (watcher.error) {
        watcher.error({
          code: errorCode * 1,
          message: errorMessages[errorCode]
        });
      }
    }
  }

  // update watchers. Call the success callback of navigator.watchPosition()
  function updateWatchers() {
    for (var watcher in watchers) {
      watcher = watchers[watcher];
      if (watcher.success) {
        watcher.success(position);
      }
    }
  }

  // call watch position with success and error callbacks.
  // sometimes even with options
  function getCurrentPosition(success, error) {
    if (position && errorCode < 0) {
      success(position);
    } else {
      error({
        code: errorCode * 1,
        message: errorMessages[errorCode]
      });
    }
  }

  // fake watchPosition() used to bind callbacks to our
  // own navigator.geolocation functions
  function watchPosition(success, error) {
    watchers[++id] = { id: id, success: success, error: error };
    return id;
  }

  function clearWatch(id) {
    delete watchers[id];
  }

  return {
    getCurrentPosition: getCurrentPosition,
    watchPosition: watchPosition,
    clearWatch: clearWatch,
    sendToRemote: sendToRemote
  };
}

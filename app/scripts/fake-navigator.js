/**
 * Will overwrite the navigator object and
 * get the geoPosition from a Websocket.
 */
var connect = (window.self === window.top) ? 'socket' : 'iframe';

if (window.geolocationRemote) {
  window.navigator = {
    geolocation: window.geolocationRemote(connect),
    userAgent: navigator.userAgent,
    language: navigator.language,
    onLine: navigator.onLine
  };

  navigator.geolocation.sendToRemote({
    init: true,
    connect: connect,
    log: 'Initialized fake navigator | ' + connect
  });
}

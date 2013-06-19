/**
 * Will overwrite the navigator object and
 * get the geoPosition from a Websocket.
 */

var useRemote = location.href.match(/(remote)/g);

if (useRemote && window.geolocationRemote) {
  var navigator = {
    geolocation: geolocationRemote(
      document.location.protocol + "//" +
      document.location.hostname + ":" +
      8888
    ),
    userAgent: navigator.userAgent,
    language: navigator.language,
    onLine: true
  };
}
/**
 * Will overwrite the navigator object and
 * get the geoPosition from a Websocket.
 */

if (window.geolocationRemote) {
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

  navigator.geolocation.sendToRemote({init: true});

  console.log('fake navigator loaded')
}
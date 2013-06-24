/**
 * Load remote modules for testing the app with a Google Maps
 */

var remote = {};
var webapp = {
  src: window.location.origin
};

$(function() {

  remote.defaults = {
    distance: 1000,
    minMovement: 8,
    angle: 80,
  };

  remote.map = new MapModel();
  remote.route = new RouteModel();
  remote.controls = new ControlsModel();

  webapp.marker = {};

  remote.socket = io.connect(
    document.location.protocol + "//" +
    document.location.hostname + ":" +
    8888
  );

  remote.socket.on('update:remote', function (data) {
    console.log('update:remote @remote');
    if (data.init && data.position) {

      if (!remote.map.latLng) {
        var options = data.options || {};

        $.extend(remote.defaults, options);

        remote.map.addCenter(data.position);

        remote.controls.enable();
      }

      updateWebapp({
        position: {
          latitude: remote.map.latLng.lat(),
          longitude: remote.map.latLng.lng()
          }
        }
      );

    } else if (data.pois) {
      remote.map.addPois(data.pois);
    } else {
      webapp.marker = data;
    }
  })

  updateIframe(window.location.search);
  initTestEvents();

  var $webappControl = $('.webapp'),
    $webappUrlInput = $webappControl.find('.url');

  $('.set-webapp').on('click', function (e) {
    updateIframe($webappUrlInput.val());
  })

  remote.controls.updateSpeed();
  remote.controls.updateAccuracy();
});

function updateWebapp (data) {

  var data = data || {},
    latLng = remote.map.latLng;

  data.position = {
    latitude: latLng && latLng.lat(),
    longitude: latLng && latLng.lng(),
    accuracy: remote.route.driving.accuracy
  }

  remote.socket.emit("update:webapp", data);
}

function updateIframe (query) {

  // prevent me from getting framed all over again and again and again ...
  if (window != window.top) {
    /* I'm in a frame! */
    return;
  }

  var src = webapp.src;
  var query = /\?/.test(query) ? query : '?' + query

  src = query ? src + query + 'remote' : src + '?remote';
  src = (/http:\/\//.test(src)) ? src : 'http://' + src;

  $('.webapp .url').val(query);

  $('iframe#webapp').attr({'src': src});
}

function initTestEvents() {
  remote.controls.on('place:changed', remote.route.updateRoutePlaces);
  remote.controls.on('speed:changed', remote.route.updateSpeed);
  remote.controls.on('accuracy:changed', remote.route.updateAccuracy);
  remote.controls.on('drive:reset', remote.route.resetDriving);
  remote.controls.on('drive:start', remote.route.startDriving);
  remote.controls.on('drive:stop', remote.route.stopDriving);

  remote.route.on('map:center', remote.map.updateCenter);
  remote.route.on('update', remote.map.updateRoute);
  remote.route.on('marker:update', remote.map.updateCenter);
  remote.route.on('drive:started', remote.controls.onDriveStarted);
  remote.route.on('drive:stopped', remote.controls.onDriveStopped);

  remote.map.on('route:changed', remote.route.onRouteChange);
}
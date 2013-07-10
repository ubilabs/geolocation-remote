/**
 * Load remote modules for testing the app with a Google Maps
 */

var remote = {
  error: -1,
  online: true
};

var webapp = {
  src: window.location.origin
};

$(function() {

  remote.defaults = {
    distance: 1000,
    minMovement: 8,
    angle: 80,
    position: {
      "lng": 9.96,
      "lat": 53.56
    }
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

  remote.controls.enable();
  remote.map.addCenter(remote.defaults.position, true);
  // remote.controls.updateRoute(pos1, pos2, geocode true||false);

  remote.socket.on('update:remote', function (data) {
    console.log('update:remote @remote');
    if (data.init) {
      updateWebapp();
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

  data.error = remote.error;
  data.online = remote.online;

  data.position = {
    coords: {
      latitude: latLng && latLng.lat(),
      longitude: latLng && latLng.lng(),
      accuracy: remote.route.driving.accuracy
    },
    timestamp: new Date().getTime()
  }
  remote.socket.emit("update:navigator", data);
}

function updateIframe (query) {

  // prevent me from getting framed all over again and again and again ...
  if (window != window.top) {
    /* I'm in a frame! */
    return;
  }

  var src = webapp.src;
  var query = /\?/.test(query) ? query : '?' + query

  src = query ? src + query + '&remote=true' : src + '?remote=true';
  src = (/http:\/\//.test(src)) ? src : 'http://' + src;

  $('.webapp .url').val(query);

  $('iframe#webapp').load(function() {
    injectJavascript();
  });

  $('iframe#webapp').attr('src', src);


}

function injectJavascript () {

  var script, iframe;

  var iframe = document.getElementById("webapp");

  var jsLibs = [
    '/remote/scripts/socket.io.min.js',
    '/remote/scripts/remote-geolocation.js',
    '/remote/scripts/remote-navigator.js'
  ]

  $.each(jsLibs, function (i, src) {

    script = iframe.contentWindow.document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    iframe.contentWindow.document.body.appendChild(script);

  })
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
var remote = {};

remote.log = new RemoteLog();

/**
 * Calls functions to update the logs in the remote control
 * @param  {string} msg   message string
 */
function remoteLog (msg) {
  remote.log.addToLogQueue('rcLog', msg);
  remote.log.updateLog('rcLog')
}

remote.app = new App();
remote.map = new MapModel();
remote.route = new RouteModel();
remote.controls = new ControlsModel();
remote.webapp = new WebAppModel();

initEvents();

remote.controls.enable();
remote.app.getPosition();


remote.socket = io.connect(
  document.location.protocol + "//" +
  document.location.hostname + ":" +
  8888
);

remote.socket.on('update:remote', function (data) {

  remoteLog('update:remote @remote' + JSON.stringify(data));

  if (data.init) {
    remote.webapp.updateNavigator();
  } else if (data.pois) {
    remote.map.addPois(data.pois);
  }
})

// get initial values
remote.controls.updateSpeed();
remote.controls.updateAccuracy();

/**
 * Initialize the events for remote control
 */
function initEvents() {
  remote.app.on('appPosition:init', remote.map.addCenter);
  remote.app.on('appPosition:init', remote.webapp.updateIframe);

  remote.controls.on('place:changed', remote.route.updateRoutePlaces);
  remote.controls.on('speed:changed', remote.route.updateSpeed);
  // remote.controls.on('accuracy:changed', remote.route.updateAccuracy);
  remote.controls.on('drive:reset', remote.route.resetDriving);
  remote.controls.on('drive:start', remote.route.startDriving);
  remote.controls.on('drive:stop', remote.route.stopDriving);
  remote.controls.on('control:changed', remote.webapp.updateNavigator);
  remote.controls.on('searchQuery:changed', remote.webapp.updateIframe);

  remote.route.on('map:center', remote.map.updateCenter);
  remote.route.on('update', remote.map.updateRoute);
  remote.route.on('marker:update', remote.map.updateCenter);
  remote.route.on('drive:started', remote.controls.onDriveStarted);
  remote.route.on('drive:stopped', remote.controls.onDriveStopped);

  remote.map.on('route:changed', remote.route.onRouteChange);
  remote.map.on('center:added', remote.webapp.updateNavigator);
  remote.map.on('center:updated', remote.webapp.updateNavigator);
}
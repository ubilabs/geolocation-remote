window.remote = window.remote || {};

remote.log = new remote.RemoteLog();
remote.app = new remote.App();
remote.map = new remote.MapModel();
remote.route = new remote.RouteModel();
remote.controls = new remote.ControlsModel();
remote.webapp = new remote.WebAppModel();
remote.comm = new remote.RemoteComm();

remote.initEvents();

remote.controls.enable();
remote.app.getPosition();

/**
 * Set initial values
 */
remote.controls.updateSpeed();
remote.controls.updateAccuracy();

/**
 * Calls functions to update the logs in the remote control
 * @param  {string} msg   message string
 */
remote.remoteLog = function(msg) {
  remote.log.addToLogQueue('rcLog', msg);
  remote.log.updateLog('rcLog');
};

/**
 * Initialize the events for remote control
 */
/* jshint maxstatements:20 */
remote.initEvents = function() {
  remote.app.on('appPosition:init', remote.map.addCenter);
  if (remote.defaults.iFrame) {
    remote.app.on('appPosition:init', remote.webapp.updateIframe);
  }

  remote.controls.on('place:changed', remote.route.updateRoutePlaces);
  remote.controls.on('speed:changed', remote.route.updateSpeed);
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

  remote.webapp.on('iframe:ready', remote.comm.iframeSetup);
};

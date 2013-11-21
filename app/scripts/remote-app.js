window.remote = window.remote || {};

/**
 * The remote app
 */
remote.App = new Model({
  /**
   * The position to start with
   * @type {Object}
   */
  defaultPosition: {
    'latitude': 53.56,
    'longitude': 9.96
  },

  /**
   * Initialize
   */
  init: function() {
    remote.log = new remote.Log();
    remote.map = new remote.Map();
    remote.route = new remote.Route();
    remote.controls = new remote.Controls();
    remote.webApp = new remote.WebApp();
    remote.communication = new remote.Communication();

    this.initEvents();
    this.getPosition();

    remote.controls.enable();
    remote.controls.updateSpeed();
    remote.controls.updateAccuracy();
  },

  /**
   * Initialize events
   */
  initEvents: function() {
    remote.controls.on('place:change', remote.route.updatePlace);
    remote.controls.on('speed:change', remote.route.updateSpeed);
    remote.controls.on('accuracy:change', remote.route.updateAccuracy);
    remote.controls.on('drive:reset', remote.route.resetDriving);
    remote.controls.on('drive:start', remote.route.startDriving);
    remote.controls.on('drive:stop', remote.route.stopDriving);
    remote.controls.on('control:change', remote.webApp.updateNavigator);
    remote.controls.on('searchQuery:change', remote.webApp.updateIframe);

    remote.route.on('map:center', remote.map.updateCenter);
    remote.route.on('update', remote.map.setRoute);
    remote.route.on('marker:update', remote.map.updateCenter);
    remote.route.on('drive:start', remote.controls.onDriveStart);
    remote.route.on('drive:stop', remote.controls.onDriveStop);

    remote.map.on('route:change', remote.route.change);
    remote.map.on('center:add', remote.webApp.updateNavigator);
    remote.map.on('center:update', remote.webApp.updateNavigator);

    remote.webApp.on('iframe:ready', remote.communication.initIframe);
  },

  /**
   * Get the current position
   */
  getPosition: function() {
    navigator.geolocation.getCurrentPosition(
      this.onPositionSuccess,
      this.onPositionError
    );
  },

  /**
   * When a position got loaded successfully
   * @param  {Position} position The position data
   */
  onPositionSuccess: function(position) {
    this.position = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    this.onPositionUpdate();
  },

  /**
   * When there was an error loading the position
   */
  onPositionError: function() {
    this.position = this.defaultPosition;

    this.onPositionUpdate();
  },

  onPositionUpdate: function() {
    remote.map.addCenter();

    if (remote.defaults.iFrame) {
      remote.webApp.updateIframe();
    }

    remote.log.rc('position:init');
  },

  /**
   * Update the current position
   * @param  {Object} latLng The position data to set
   */
  updatePosition: function(latLng) {
    this.position = {
      latitude: latLng.lat(),
      longitude: latLng.lng()
    };
  }
});

remote.app = new remote.App();

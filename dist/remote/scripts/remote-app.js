var App = Model({

  error: -1,
  onLine: true,

  defaultPosition: {
    "latitude": 53.56,
    "longitude": 9.96
  },

  init: function() {
  },

  getPosition: function () {
    // get current pos from real navigator or use backup
    navigator.geolocation.getCurrentPosition(this.getPosSuccess, this.getPosError);
  },

  getPosSuccess: function (position) {
    this.position = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    remoteLog('appPosition:init');
    this.trigger('appPosition:init');
  },

  getPosError: function () {
    this.position = this.defaultPosition

    remoteLog('appPosition:init');
    this.trigger('appPosition:init');
  },

  updatePosition: function (latLng) {
    this.position = {
      latitude: latLng.lat(),
      longitude: latLng.lng()
    };
  }

})

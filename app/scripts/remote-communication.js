window.remote = window.remote || {};

/**
 * Communication with the clients
 */
remote.Communication = new Model({
  /**
   * Initialize
   */
  init: function() {
    var pusher = new Pusher(remote.pusherConfig.KEY, {
        authEndpoint: remote.pusherConfig.authEndpoint
      }),
      channel = pusher.subscribe('private-remoteLocationManager');

    channel.bind('pusher:subscription_succeeded', _.bind(function() {
      this.channel = channel;
    }, this));

    channel.bind('locationUpdate', function(data) {
      alert('An event was triggered with message: ' + data.message);
    });
  },

  /**
   * Initialize the Iframe
   */
  initIframe: function() {
    this.$iframe = document.querySelector('#webapp');

    window.addEventListener('message', this.onMessageReceived, false);
  },

  /**
   * Send data to the connected clients
   * @param  {Object} data The data to send containing a position
   */
  sendToClients: function(data) {
    if (this.channel) {
      this.channel.trigger('client-locationUpdate', data);
    }

    if (this.$iframe) {
      this.$iframe.contentWindow.postMessage(data, window.location.origin);
    }
  },

  /**
   * When a message got received
   * @param  {MessageEvent} event The event data
   */
  onMessageReceived: function(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    var data = event.data;

    this.handleLogData(data);
    this.handlePositionData(data);
    this.handleInitData(data);
    this.handlePoisData(data);
    this.handleOptionsData(data);
  },

  /**
   * Handle log data
   * @param  {Object} data The complete data
   */
  handleLogData: function(data) {
    if (!data.log) {
      return;
    }

    remote.log.client(data.log);
  },

  /**
   * Handle position data
   * @param  {Object} data The complete data
   */
  handlePositionData: function(data) {
    if (!data.position) {
      return;
    }

    data.latLng = new google.maps.LatLng(
      data.position.lat,
      data.position.lng
    );

    remote.map.updateCenter(data, true);
  },

  /**
   * Handle init data
   * @param  {Object} data The complete data
   */
  handleInitData: function(data) {
    if (!data.init) {
      return;
    }

    remote.webApp.updateNavigator();

    if (data.connect === 'iframe') {
      delete remote.socket;
    }
  },

  /**
   * Handle pois data
   * @param  {Object} data The complete data
   */
  handlePoisData: function(data) {
    if (!data.pois) {
      return;
    }

    remote.map.addPois(data.pois);
  },

  /**
   * Handle options data
   * @param  {Object} data The complete data
   */
  handleOptionsData: function(data) {
    if (!data.options) {
      return;
    }

    _.each(data.options, function(value, key) {
      remote.defaults[key] = value;
    });

    remote.map.updateCenter();
  }
});

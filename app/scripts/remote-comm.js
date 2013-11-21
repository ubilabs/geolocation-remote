window.remote = window.remote || {};

remote.RemoteComm = new Model({
  init: function() {
    this.socketSetup();
  },

  sendToClients: function(data) {
    if (this.channel) {
      this.channel.trigger('client-locationUpdate', data);
    }

    if (this.$iframe) {
      this.$iframe.contentWindow.postMessage(data, window.location.origin);
    }
  },

  onMessageReceived: function(data) {
    if (data.log) {
      remote.log.receiveMessage('clientLog', data.log);
    } else {
      remote.app.onDataReceived(data.data);
    }

  },

  postMessageReceive: function() {
    if (event.origin !== window.location.origin) {
      return;
    }

    this.onMessageReceived(event.data);
  },

  iframeSetup: function() {
    this.$iframe = document.querySelector('#webapp');
    window.addEventListener('message', this.postMessageReceive, false);
  },

  socketSetup: function() {
    var pusher = new Pusher(remote.pusherConfig.KEY, {
        authEndpoint: remote.pusherConfig.authEndpoint
      }),
      channel = pusher.subscribe('private-remoteLocationManager');

    channel.bind('pusher:subscription_succeeded', function() {
      this.channel = channel;
    }.bind(this));

    channel.bind('locationUpdate', function(data) {
      alert('An event was triggered with message: ' + data.message);
    });
  }
});

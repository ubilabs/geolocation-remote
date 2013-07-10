var WebAppModel = Model({

  marker: {},

  init: function() {
  },

  updateNavigator: function(data) {
    var data = data || {};

    data.error = remote.error;
    data.onLine = remote.onLine;

    data.position = {
      coords: {
        latitude: remote.app.position.latitude,
        longitude: remote.app.position.longitude,
        accuracy: remote.route.driving.accuracy
      },
      timestamp: new Date().getTime()
    }

    remoteLog('update:navigator' + JSON.stringify(data));

    remote.socket.emit("update:navigator", data);
  },

  updateIframe: function(query) {

    // prevent me (the remote) from getting framed all over again and again and again ...
    if (window != window.top) {
      return;
    }

    var origin = window.location.origin,
      search = query || '?remote=true&' + window.location.search.replace('?',''),
      src = origin + search

    // set http if not
    src = (/(http||https):\/\//.test(src)) ? src : 'http://' + src;

    // update control
    $('.webapp .url').val(search);

    // listen for iframe to load and inject the javascript into the webapp
    $('iframe#webapp').load(function() {
      this.injectJavascript();
    }.bind(this));

    // set src attr to iframe
    $('iframe#webapp').attr('src', src);
  },

  injectJavascript: function() {

    var script, iframe;

    var iframe = document.getElementById("webapp");

    var jsLibs = [
      '/remote/scripts/vendor/socket.io.min.js',
      '/remote/scripts/fake-geolocation.js',
      '/remote/scripts/fake-navigator.js',
      '/remote/scripts/client-scripts.js'
    ]

    $.each(jsLibs, function (i, src) {

      script = iframe.contentWindow.document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      iframe.contentWindow.document.body.appendChild(script);

    })
  }
});
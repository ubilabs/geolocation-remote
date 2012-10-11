
(function(){

  var position = new google.maps.LatLng(-25.363882,131.044922);

  var options = {
    zoom: 4,
    center: position,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById('map_canvas'), options);

  var marker = new google.maps.Marker({
    position: position,
    map: map,
    draggable: true
  });

  var socket = io.connect('http://localhost:8888');

  google.maps.event.addListener(marker, "drag", function(event){
    var position = event.latLng;
    socket.emit("update", {
      lat: position.lat(),
      lng: position.lng()
    });
  });

  var currentPosition;

  socket.on('update', function (data) {

    var watcher;

    currentPosition = {
      coords: {
        latitude: data.lat,
        longitude: data.lng,
        accuracy: 10
      },
      timestamp: new Date()
    };

    for (var all in watchers){
      watcher = watchers[all];
  
      if (watcher.success){
        watcher.success(currentPosition);
      }
    }
  });

  var watchers = {},
    id = 0;

  var geolocation = {
    getCurrentPosition: function(success, error, options){
      if (currentPosition){
        success(currentPosition);
      } else {
        var id = geolocation.watchPosition(function(position){
          success(currentPosition);
          geolocation.clearWatch(id);
        });
      }

    },
    watchPosition: function(success, error, options){
      watchers[++id] = { id: id, success: success, error: error };
      return id;
    },
    clearWatch: function(id){
      delete watchers[id];
    }
  };
  
  geolocation.watchPosition(function(position){
    marker.setPosition(new google.maps.LatLng(
      position.coords.latitude,
      position.coords.longitude
    ));
  });

  window.geolocation = geolocation;

})();


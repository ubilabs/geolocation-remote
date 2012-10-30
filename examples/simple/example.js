(function(){

  var position = new google.maps.LatLng(-25.363882,131.044922);

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: position,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  var marker = new google.maps.Marker({
    position: position,
    map: map,
    draggable: true
  });

  var geolocation = geolocationRemote("http://localhost:8888");

  google.maps.event.addListenerOnce(map, "bounds_changed", setMarkerInBounds);
  google.maps.event.addListener(marker, "position_changed", setMarkerInBounds);

  function setMarkerInBounds() {
    var bounds = map.getBounds(),
      position = marker.getPosition();

    if (bounds && !bounds.contains(position)) {
      map.setCenter(position);
    }
  }

  google.maps.event.addListener(marker, "drag", function(event){
    var position = event.latLng;

    geolocation.updatePosition({
      latitude: position.lat(),
      longitude: position.lng(),
      accuracy: 10
    });
  });

  geolocation.watchPosition(function(position){
    marker.setPosition(new google.maps.LatLng(
      position.coords.latitude,
      position.coords.longitude
    ));
  });
  
})();
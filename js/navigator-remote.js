var myLatlng = new google.maps.LatLng(-25.363882,131.044922);

var options = {
  zoom: 4,
  center: myLatlng,
  mapTypeId: google.maps.MapTypeId.ROADMAP
};

var map = new google.maps.Map(document.getElementById('map_canvas'), options);

var marker = new google.maps.Marker({
  position: myLatlng,
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

socket.on('update', function (data) {
  marker.setPosition(new google.maps.LatLng(
    data.lat, 
    data.lng
  ));
});
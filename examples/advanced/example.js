var remote = {};

$(document).ready(function() {
  remote.$doc = $(document);
  remote.map.init();
  remote.controls.init();
});


/**
 * The map
 */
remote.map = (function() {
  var position = new google.maps.LatLng(-25.363882, 131.044922),
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: position,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }),
    geolocation = geolocationRemote("http://localhost:8888"),
    marker = {
      car: new google.maps.Marker({
        position: position,
        map: map,
        draggable: true
      }),
      route: {
        from: false,
        to: false
      }
    },
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer();

  directionsDisplay.setMap(map);

  function initEvents() {
    google.maps.event.addListener(marker.car, "drag", function(event){
      var position = event.latLng;

      geolocation.updatePosition({
        latitude: position.lat(),
        longitude: position.lng(),
        accuracy: 10
      });
    });

    geolocation.watchPosition(function(position){
      marker.car.setPosition(new google.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      ));
    });

    remote.$doc.on('place_changed', function(event, data) {
      updateRouteMarker(data.type, data.place);
    });
  }

  function updateRouteMarker(type, place) {
    if (!marker.route[type]) {
      marker.route[type] = new google.maps.Marker({
        map: map,
        draggable: true
      });
    }

    marker.route[type].setPosition(place.geometry.location);

    if (marker.route.from && marker.route.to) {
      updateRoute();
    }
  }

  function updateRoute() {
    var request = {
      origin: marker.route.from.getPosition(),
      destination: marker.route.to.getPosition(),
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
  }

  function init() {
    initEvents();
  }

  return {
    init: init,
    map: map
  };
})();


/**
 * The controls
 */
remote.controls = (function() {
  var $controls;

  function initEvents() {
    $controls.find('.toggle').on('click', function(event) {
      event.preventDefault();

      $controls.toggleClass('hidden');
    });
  }

  function initAutocomplete(elemId) {
    var input = document.getElementById(elemId),
      autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', remote.map.map);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      remote.$doc.trigger('place_changed', {
        type: elemId,
        place: autocomplete.getPlace()
      });
    });
  }

  function init() {
    $controls = $('#controls');

    initEvents();
    initAutocomplete('from');
    initAutocomplete('to');
  }

  return {
    init: init
  };
})();

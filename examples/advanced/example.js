var remote = {};

$(document).ready(function() {
  remote.$doc = $(document);

  remote.SPEED = 50; // km/h

  remote.map.init();
  remote.controls.init();
  remote.route.init();
});


/**
 * The map
 */
remote.map = (function() {
  var startPosition = new google.maps.LatLng(-25.363882, 131.044922),
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: startPosition,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }),
    geolocation = geolocationRemote("http://localhost:8888"),
    marker = new google.maps.Marker({
      position: startPosition,
      map: map,
      draggable: true
    }),
    directionsDisplay = new google.maps.DirectionsRenderer({
      draggable: true,
      map: map
    });

  function init() {
    google.maps.event.addListener(marker, "drag", function(event){
      var position = event.latLng;

      updateGeolocation(position);
    });

    geolocation.watchPosition(function(position){
      marker.setPosition(new google.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      ));
    });

    remote.$doc.on('marker:update', updateMarker);
    remote.$doc.on('route:update', updateRoute);
  }

  function updateGeolocation(position) {
    geolocation.updatePosition({
      latitude: position.lat(),
      longitude: position.lng(),
      accuracy: 10
    });
  }

  function updateMarker(event, position) {
    marker.setPosition(position);
    updateGeolocation(position);
  }

  function updateRoute(event, route) {
    directionsDisplay.setDirections(route);
  }

  return {
    init: init,
    map: map,

    getMarkerPosition: function() {
      return marker.getPosition();
    }
  };
})();


/**
 * The routes
 */
remote.route = (function() {
  var route = {},
    driving = {},
    distance = {},
    directionsService = new google.maps.DirectionsService();

  function init() {
    remote.$doc.on('place:changed', function(event, data) {
      updateRoute(data.type, data.place);
    });

    remote.$doc.on('drive:start', startDriving);
    remote.$doc.on('drive:stop', stopDriving);
  }

  function updateRoute(type, place) {
    route[type] = place.geometry.location;

    if (route.from && route.to) {
      loadRoute();
    }
  }

  function loadRoute() {
    var request = {
      origin: route.from,
      destination: route.to,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        remote.$doc.trigger('route:update', response);
        route.details = response.routes[0];
      } else {
        route.details = {};
      }
    });
  }

  function startDriving() {
    if (route.from && route.to && route.details.overview_path) {
      calculateStepDistances();
      remote.$doc.trigger('marker:update', route.from);
      driving.time = new Date();
      driving.progress = 0;

      driving.interval = setInterval(drive, 500);
      remote.$doc.trigger('drive:started');
    }
  }

  function stopDriving() {
    clearInterval(driving.interval);
    remote.$doc.trigger('drive:stopped');
  }

  function calculateStepDistances() {
    var previous, previousPosition;

    route.distance = {
      steps: {},
      total: 0
    };

    $.each(route.details.overview_path, function(i, position) {
      previous = ((i - 1) < 0) ? 0 : i - 1;
      previousPosition = route.details.overview_path[previous];

      route.distance.steps[i] = google.maps.geometry.spherical.computeDistanceBetween(
        position,
        previousPosition
      );

      route.distance.total = route.distance.total + route.distance.steps[i];
    });
  }

  function drive() {
    var time = new Date(),
      timeDelta = time - driving.time,
      progressDelta = remote.SPEED / (60 * 60 * 1000) * timeDelta * 1000,
      progress = driving.progress + progressDelta,
      newPosition;

    if (progress > route.distance.total) {
      stopDriving();
      return;
    }

    newPosition = getNewPosition(progress, progressDelta);
    remote.$doc.trigger('marker:update', newPosition);

    driving.time = time;
    driving.progress = progress;
  }

  function getNewPosition(progress, progressDelta) {
    var position = remote.map.getMarkerPosition(),
      distance = 0,
      previousStep, nextStep, heading, newPosition;

    $.each(route.distance.steps, function(i, step) {
      distance = distance + step;
      i = parseInt(i, 10);

      if (progress < distance) {
        nextStep = route.details.overview_path[i];
        previousStep = route.details.overview_path[i - 1];
        return false;
      }
    });

    heading = google.maps.geometry.spherical.computeHeading(previousStep, nextStep);
    newPosition = google.maps.geometry.spherical.computeOffset(
      position,
      progressDelta,
      heading
    );

    return newPosition;
  }

  return {
    init: init
  };
})();


/**
 * The controls
 */
remote.controls = (function() {
  var $controls, $driveButton;

  function initEvents() {
    $controls.find('.toggle').on('click', function(event) {
      event.preventDefault();

      $controls.toggleClass('hidden');
    });

    $driveButton.on('click', function(event) {
      event.preventDefault();

      if ($driveButton.hasClass('cancel')) {
        remote.$doc.trigger('drive:stop');
      } else {
        remote.$doc.trigger('drive:start');
      }
    });

    remote.$doc.on('drive:started', function() {
      $driveButton.html('Stop driving').addClass('cancel');
    });

    remote.$doc.on('drive:stopped', function() {
      $driveButton.html('Drive').removeClass('cancel');
    });
  }

  function initAutocomplete(elemId) {
    var input = document.getElementById(elemId),
      autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', remote.map.map);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      remote.$doc.trigger('place:changed', {
        type: elemId,
        place: autocomplete.getPlace()
      });
    });
  }

  function init() {
    $controls = $('#controls');
    $driveButton = $controls.find('#drive');

    initEvents();
    initAutocomplete('from');
    initAutocomplete('to');
  }

  return {
    init: init
  };
})();

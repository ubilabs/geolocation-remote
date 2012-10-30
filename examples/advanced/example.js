var remote = {};

$(document).ready(function() {
  remote.$doc = $(document);

  remote.map.init();
  remote.route.init();
  remote.controls.init();
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

    google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
      remote.$doc.trigger('route:changed', directionsDisplay);
    });

    remote.$doc.on('map:center', updateCenter);
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

  function updateCenter(event, place) {
    map.setCenter(place.geometry.location);
    map.setZoom(14);
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
    directionsService = new google.maps.DirectionsService();

  function init() {
    remote.$doc.on('place:changed', function(event, data) {
      updateRoutePlaces(data.type, data.place);
    });

    remote.$doc.on('route:changed', function(event, data) {
      if (data.directions && data.directions.routes && data.directions.routes.length) {
        updateRoute(data.directions.routes[0]);
      }
    });

    remote.$doc.on('speed:changed', function(event, speed) {
      updateSpeed(speed);
    });

    remote.$doc.on('accuracy:changed', function(event, accuracy) {
      updateAccuracy(accuracy);
    });

    remote.$doc.on('drive:reset', resetDriving);
    remote.$doc.on('drive:start', startDriving);
    remote.$doc.on('drive:stop', stopDriving);
  }

  function updateRoutePlaces(type, place) {
    route[type] = place.geometry.location;

    if (route.from && route.to) {
      loadRoute();
    } else {
      remote.$doc.trigger('map:center', place);
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
        updateRoute(response.routes[0]);
        resetDriving();
      } else {
        updateRoute({});
        resetDriving();
      }
    });
  }

  function updateRoute(routeDetails) {
    route.details = routeDetails;
    calculateStepDistances();
  }

  function updateSpeed(speed) {
    driving.speed = speed;
  }

  function updateAccuracy(accuracy) {
    driving.accuracy = accuracy;
  }

  function resetDriving() {
    if (route.details && route.details.overview_path) {
      remote.$doc.trigger('marker:update', route.details.overview_path[0]);
    }

    driving.progress = 0;
  }

  function startDriving() {
    if (route.details && route.details.overview_path) {
      driving.time = new Date();

      clearInterval(driving.interval);
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
      steps: [],
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
      progressDelta = driving.speed / (60 * 60 * 1000) * timeDelta * 1000,
      oldProgress = driving.progress,
      newProgress = oldProgress + progressDelta,
      newPosition;

    if (newProgress > route.distance.total) {
      newProgress = route.distance.total;
      stopDriving();
    }

    newPosition = getNewPosition(newProgress);
    remote.$doc.trigger('marker:update', newPosition);

    driving.time = time;
    driving.progress = newProgress;
  }

  function getNewPosition(newProgress) {
    var distance = 0,
      previousStep, nextStep, previousStepProgress, progressFromPrevious, newPosition;

    $.each(route.distance.steps, function(i, step) {
      distance = distance + step;
      i = parseInt(i, 10);

      if (newProgress <= distance) {
        nextStep = route.details.overview_path[i];
        previousStep = route.details.overview_path[i - 1];
        previousStepProgress = distance - step;
        progressFromPrevious = newProgress - previousStepProgress;

        return false;
      }
    });

    newPosition = calculatePosition(progressFromPrevious, previousStep, nextStep);

    if (driving.accuracy) {
      newPosition = applyAccuracy(newPosition);
    }

    return newPosition;
  }

  function calculatePosition(progressFromPrevious, previousStep, nextStep) {
    var heading = google.maps.geometry.spherical.computeHeading(previousStep, nextStep),
      position = google.maps.geometry.spherical.computeOffset(
        previousStep,
        progressFromPrevious,
        heading
      );

    return position;
  }

  function applyAccuracy(position) {
    var heading = (Math.random() * 360) - 180,
      distance = Math.random() * driving.accuracy;

      position = google.maps.geometry.spherical.computeOffset(
        position,
        distance,
        heading
      );

    return position;
  }

  return {
    init: init
  };
})();


/**
 * The controls
 */
remote.controls = (function() {
  var $controls, $driveButton, $resetButton,
    $speedDisplay, $speedSlider,
    $accuracyDisplay, $accuracySlider;

  function initEvents() {
    $controls.find('.toggle').on('click', function(event) {
      event.preventDefault();

      $controls.toggleClass('hidden');
    });

    $speedSlider.on('change', updateSpeed);

    $accuracySlider.on('change', updateAccuracy);

    $driveButton.on('click', function(event) {
      event.preventDefault();

      if ($driveButton.hasClass('cancel')) {
        remote.$doc.trigger('drive:stop');
      } else {
        remote.$doc.trigger('drive:start');
      }
    });

    $resetButton.on('click', function(event) {
      event.preventDefault();

      remote.$doc.trigger('drive:reset');
    });

    remote.$doc.on('drive:started', function() {
      $driveButton.removeClass().addClass('button cancel icon-pause');
    });

    remote.$doc.on('drive:stopped', function() {
      $driveButton.removeClass().addClass('button icon-play');
    });
  }

  function updateSpeed() {
    var speed = $speedSlider.val();

    $speedDisplay.html(speed);
    remote.$doc.trigger('speed:changed', speed);
  }

  function updateAccuracy() {
    var accuracy = $accuracySlider.val();

    $accuracyDisplay.html(accuracy);
    remote.$doc.trigger('accuracy:changed', accuracy);
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
    $resetButton = $controls.find('#reset');
    $speedDisplay = $controls.find('#speed-display span');
    $speedSlider = $controls.find('#speed');
    $accuracyDisplay = $controls.find('#accuracy-display span');
    $accuracySlider = $controls.find('#accuracy');

    updateSpeed();
    updateAccuracy();

    initEvents();
    initAutocomplete('from');
    initAutocomplete('to');
  }

  return {
    init: init
  };
})();

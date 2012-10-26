var remote = {};

$(document).ready(function() {
  remote.$doc = $(document);

  remote.SPEED = 50; // km/h

  remote.map.init();
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
    marker = {
      car: new google.maps.Marker({
        position: startPosition,
        map: map,
        draggable: true
      })
    },
    route = {},
    driving = {},
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer({
      draggable: true
    });

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
        directionsDisplay.setDirections(response);
        route.details = response.routes[0];
      } else {
        route.details = {};
      }
    });
  }

  function startDriving() {
    if (route.from && route.to && route.details.overview_path) {
      calculateStepDistances();
      marker.car.setPosition(route.from);
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
    marker.car.setPosition(newPosition);

    driving.time = time;
    driving.progress = progress;
  }

  function getNewPosition(progress, progressDelta) {
    var position = marker.car.getPosition(),
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

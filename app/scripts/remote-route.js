// The route to drive along
var RouteModel = Model({
  init: function() {
    this.route = {};
    this.driving = {};
    this.directionsService = new google.maps.DirectionsService();
  },

  onRouteChange: function(data) {
    if (data.directions && data.directions.routes && data.directions.routes.length) {
      this.updateRoute(data.directions.routes[0]);
    }
  },

  updateSpeed: function(data) {
    this.driving.speed = data.speed;
  },

  updateAccuracy: function(data) {
    this.driving.accuracy = data.accuracy;
  },

  updateRoutePlaces: function(data) {
    var type = data.type,
      place = data.place;

    this.route[type] = place.geometry.location;

    if (this.route.from && this.route.to) {
      this.loadRoute();
    } else {
      this.trigger('map:center', {latLng: this.route[type]});
    }
  },

  loadRoute: function() {

    var request = {
      origin: this.route.from,
      destination: this.route.to,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    this.directionsService.route(request, _.bind(function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        this.trigger('update', {route: response});
        this.updateRoute(response.routes[0]);
        this.resetDriving();
      } else {
        this.updateRoute({});
        this.resetDriving();
      }
    }, this));
    
  },

  updateRoute: function(routeDetails) {
    this.route.path = [];

    $.each(routeDetails.legs, _.bind(function(i, leg) {
      $.each(leg.steps, _.bind(function(k, step) {
        $.each(step.path, _.bind(function(l, point) {
          if (l !== 0 || (i === 0 && k === 0 && l === 0)) {
            this.route.path.push(point);
          }
        }, this));
      }, this));
    }, this));

    this.calculateStepDistances();
  },

  calculateStepDistances: function() {
    var previous, previousPosition;

    this.route.distance = {
      steps: [],
      total: 0
    };

    _.each(this.route.path, _.bind(function(position, i) {
      previous = ((i - 1) < 0) ? 0 : i - 1;
      previousPosition = this.route.path[previous];

      this.route.distance.steps[i] = google.maps.geometry.spherical.computeDistanceBetween(
        position,
        previousPosition
      );

      this.route.distance.total = this.route.distance.total + this.route.distance.steps[i];
    }, this));
  },

  resetDriving: function() {

    if (this.route.path) {
      this.trigger('marker:update', {latLng: this.route.path[0]});
    }

    this.driving.progress = 0;
  },

  startDriving: function() {
    if (this.route.path) {
      this.driving.time = new Date();

      clearInterval(this.driving.interval);
      this.driving.interval = setInterval(this.drive, 1500);
      this.trigger('drive:started');
    }
  },

  stopDriving: function() {
    clearInterval(this.driving.interval);
    this.trigger('drive:stopped');
  },

  drive: function() {

    var time = new Date(),
      timeDelta = time - this.driving.time,
      progressDelta = this.driving.speed / (60 * 60 * 1000) * timeDelta * 1000,
      oldProgress = this.driving.progress,
      newProgress = oldProgress + progressDelta,
      newPosition;

    if (newProgress > this.route.distance.total) {
      newProgress = this.route.distance.total;
      this.stopDriving();
    }

    newPosition = this.getNewPosition(newProgress);
    
    this.trigger('marker:update', {latLng: newPosition, accuracy: this.driving.accuracy});

    this.driving.time = time;
    this.driving.progress = newProgress;
  },

  getNewPosition: function(newProgress) {
    var distance = 0,
      previousStep, nextStep, previousStepProgress, progressFromPrevious, newPosition;

    _.each(this.route.distance.steps, _.bind(function(step, i) {

      distance = distance + step;
      i = parseInt(i, 10);

      if (newProgress <= distance) {
        nextStep = this.route.path[i];
        previousStep = this.route.path[i - 1];
        previousStepProgress = distance - step;
        progressFromPrevious = newProgress - previousStepProgress;

        return false;
      }
    }, this));

    newPosition = this.calculatePosition(progressFromPrevious, previousStep, nextStep);

    if (this.driving.accuracy) {
      newPosition = this.applyAccuracy(newPosition);
    }

    return newPosition;
  },

  calculatePosition: function(progressFromPrevious, previousStep, nextStep) {
    var heading = google.maps.geometry.spherical.computeHeading(previousStep, nextStep),
      position = google.maps.geometry.spherical.computeOffset(
        previousStep,
        progressFromPrevious,
        heading
      );

    return position;
  },

  applyAccuracy: function(position) {
    var heading = (Math.random() * 360) - 180,
      distance = Math.random() * this.driving.accuracy;

    position = google.maps.geometry.spherical.computeOffset(
      position,
      distance,
      heading
    );

    return position;
  }
});
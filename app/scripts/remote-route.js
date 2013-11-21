window.remote = window.remote || {};

/**
 * The route to drive along
 */
remote.Route = new Model({
  /**
   * Initialize
   */
  init: function() {
    this.route = {};
    this.driving = {};
    this.directionsService = new google.maps.DirectionsService();
  },

  /**
   * When the route got changed
   * @param  {Object} route The route to set
   */
  change: function(route) {
    this.updateRoute(route);
  },

  /**
   * Set a new speed
   * @param  {Number} speed The new speed
   */
  updateSpeed: function(speed) {
    this.driving.speed = speed;
  },

  /**
   * Set a new accuracy
   * @param  {Number} accuracy The new accuracy
   */
  updateAccuracy: function(accuracy) {
    this.driving.accuracy = accuracy;
  },

  /**
   * Set the new place fot the route
   * @param  {Object} data The place data
   */
  updatePlace: function(data) {
    var type = data.type,
      place = data.place;

    this.route[type] = place.geometry.location;

    if (this.route.from && this.route.to) {
      this.loadRoute();
    } else {
      this.trigger('map:center', {latLng: this.route[type]});
    }
  },

  /**
   * Load the set route
   */
  loadRoute: function() {
    var request = {
      origin: this.route.from,
      destination: this.route.to,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    this.directionsService.route(request, _.bind(function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        this.trigger('update', response);
        this.updateRoute(response.routes[0]);
      } else {
        this.updateRoute({});
      }

      this.resetDriving();
    }, this));
  },

  /**
   * Update the route with the passed details
   * @param  {Object} routeDetails The details of the route
   */
  updateRoute: function(routeDetails) {
    this.route.path = [];

    _.each(routeDetails.legs, function(leg, i) {
      _.each(leg.steps, function(step, k) {
        _.each(step.path, function(point, l) {
          if (l !== 0 || (i === 0 && k === 0 && l === 0)) {
            this.route.path.push(point);
          }
        }, this);
      }, this);
    }, this);

    this.calculateStepDistances();
  },

  /**
   * Calculate the distances from each step
   */
  calculateStepDistances: function() {
    var computeDistance = google.maps.geometry.spherical.computeDistanceBetween,
      previous, previousPosition;

    this.route.distance = {
      steps: [],
      total: 0
    };

    _.each(this.route.path, _.bind(function(position, i) {
      previous = ((i - 1) < 0) ? 0 : i - 1;
      previousPosition = this.route.path[previous];

      this.route.distance.steps[i] = computeDistance(
        position,
        previousPosition
      );

      this.route.distance.total = this.route.distance.total +
        this.route.distance.steps[i];
    }, this));
  },

  /**
   * Reset the driver
   */
  resetDriving: function() {
    if (this.route.path) {
      this.trigger('marker:update', {latLng: this.route.path[0]});
    }

    this.driving.progress = 0;
  },

  /**
   * Start driving along the route
   */
  startDriving: function() {
    if (this.route.path) {
      this.driving.time = new Date();

      clearInterval(this.driving.interval);
      this.driving.interval = setInterval(this.drive, 1500);
      this.trigger('drive:start');
    }
  },

  /**
   * Stop the driver
   */
  stopDriving: function() {
    clearInterval(this.driving.interval);
    this.trigger('drive:stop');
  },

  /**
   * Drive along the route
   */
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

    this.trigger(
      'marker:update',
      {
        latLng: newPosition,
        accuracy: this.driving.accuracy
      }
    );

    this.driving.time = time;
    this.driving.progress = newProgress;
  },

  /**
   * Get a new position along the route, according the progress
   * @param  {Number} newProgress The progress
   * @return {Object}             The new position on the route
   */
  getNewPosition: function(newProgress) {
    var distance = 0,
      previousStep, nextStep, previousStepProgress, progressFromPrevious,
      newPosition;

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

    newPosition = this.calculatePosition(
      progressFromPrevious,
      previousStep,
      nextStep
    );

    if (this.driving.accuracy) {
      newPosition = this.applyAccuracy(newPosition);
    }

    return newPosition;
  },

  /**
   * Calculate the new position
   * @param  {Number} progressFromPrevious The progress since the previous step
   * @param  {Object} previousStep         The previous step on the route
   * @param  {Object} nextStep             The next step on the route
   * @return {Object}                      The new position on the route
   */
  calculatePosition: function(progressFromPrevious, previousStep, nextStep) {
    var heading = google.maps.geometry.spherical.computeHeading(
        previousStep,
        nextStep
      ),
      position = google.maps.geometry.spherical.computeOffset(
        previousStep,
        progressFromPrevious,
        heading
      );

    return position;
  },

  /**
   * Depending on the accuracy change the position
   * @param  {Object} position The position to change
   * @return {Object}          The position with fuzzy accuracy
   */
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

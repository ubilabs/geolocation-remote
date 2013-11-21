window.remote = window.remote || {};

// The control elements in the remote
remote.ControlsModel = new Model({
  speed: 0,

  init: function() {
    this.$controls = $('#controls');
    this.$controlItems = this.$controls.find('.control-item');

    this.$driveButton = this.$controls.find('#drive');
    this.$resetButton = this.$controls.find('#reset');
    this.$speedDisplay = this.$controls.find('#speed-display span');
    this.$speedSlider = this.$controls.find('#speed');
    this.$accuracyDisplay = this.$controls.find('#accuracy-display span');
    this.$accuracySlider = this.$controls.find('#accuracy');
    this.$gpsError = this.$controls.find('.gps_error select');
    this.$isOnline = this.$controls.find('input.is-online');
    this.$setSearchQuery = this.$controls.find('.set-webapp');

    this.initEvents();

    this.initAutocomplete(remote.map.map, 'from');
    this.initAutocomplete(remote.map.map, 'to');
  },

  /**
   * Initialize events
   */
  initEvents: function() {
    this.$speedSlider.on('change', this.updateSpeed);
    this.$speedSlider.on('mouseup', function() {
      this.trigger('control:changed');
    }.bind(this));

    this.$accuracySlider.on('change', this.updateAccuracy);
    this.$driveButton.on('click', this.onDriveButtonClick);
    this.$resetButton.on('click', this.onResetButtonClick);
    this.$gpsError.on('change', this.setGpsError);
    this.$isOnline.on('change', this.setOnline);
    this.$setSearchQuery.on('click', this.updateSearchQuery);
  },

  enable: function() {
    _.each(this.$controlItems, this.enableControl);
  },

  enableControl: function(e) {
    $(e).removeAttr('disabled');
  },

  disable: function() {
    _.each(this.$controlItems, this.disableControl);
  },

  disableControl: function(e) {
    $(e).attr('disabled', 'disabled');
  },

  setOnline: function() {
    var isOnline = $(event.target).is(':checked');
    remote.onLine = isOnline;

    this.trigger('control:changed');
  },

  setGpsError: function(event) {
    event.preventDefault();
    var errorType = $(event.target).find(':selected').val();
    remote.error = errorType;

    this.trigger('control:changed');
  },

  onDriveButtonClick: function(event) {
    event.preventDefault();

    if (this.$driveButton.hasClass('cancel')) {
      this.trigger('drive:stop');
    } else {
      this.trigger('drive:start');
    }
  },

  onResetButtonClick: function(event) {
    event.preventDefault();

    this.trigger('drive:reset');
  },

  onDriveStarted: function() {
    this.$driveButton.removeClass().addClass('button cancel icon-pause');
  },

  onDriveStopped: function() {
    this.$driveButton.removeClass().addClass('button icon-play');
  },

  updateSpeed: function() {
    this.speed = this.$speedSlider.val();
    console.log(this.speed);

    this.$speedDisplay.html(this.speed);
    this.trigger('speed:changed', {speed: this.speed});
  },

  updateAccuracy: function() {
    var accuracy = this.$accuracySlider.val();

    this.$accuracyDisplay.html(accuracy);
    this.trigger('accuracy:changed', {accuracy: accuracy});
    this.trigger('accuracy:changed');
  },

  initAutocomplete: function(map, elemId) {
    var input = document.getElementById(elemId),
      autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', map);

    google.maps.event.addListener(
      autocomplete,
      'place_changed',
      _.bind(function() {
        this.trigger('place:changed', {
          type: elemId,
          place: autocomplete.getPlace()
        });
      },
      this)
    );
  },

  updateSearchQuery: function() {
    var $webappControl = $('.webapp'),
    $webappUrlInput = $webappControl.find('.url');

    $('.set-webapp').on('click', function() {
      this.trigger('searchQuery:changed', $webappUrlInput.val());
    }.bind(this));
  }
});

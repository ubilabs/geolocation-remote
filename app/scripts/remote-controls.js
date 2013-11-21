window.remote = window.remote || {};

/**
 * The control elements in the remote
 */
remote.Controls = new Model({
  /**
   * Initialize
   */
  init: function() {
    this.speed = 0;

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
      this.trigger('control:change');
    }.bind(this));

    this.$accuracySlider.on('change', this.updateAccuracy);
    this.$driveButton.on('click', this.onDriveButtonClick);
    this.$resetButton.on('click', this.onResetButtonClick);
    this.$gpsError.on('change', this.setGpsError);
    this.$isOnline.on('change', this.setOnline);
    this.$setSearchQuery.on('click', this.updateSearchQuery);
  },

  /**
   * Enable the control items
   */
  enable: function() {
    _.each(this.$controlItems, function(element) {
      $(element).removeAttr('disabled');
    });
  },

  /**
   * Disable the control items
   */
  disable: function() {
    _.each(this.$controlItems, function(element) {
      $(element).attr('disabled', 'disabled');
    });
  },

  /**
   * Update the online status
   */
  setOnline: function() {
    var isOnline = $(event.target).is(':checked');

    remote.onLine = isOnline;
    this.trigger('control:change');
  },

  /**
   * Update whether there is a GPS error or not
   * @param {Event} event The JQuery Event
   */
  setGpsError: function(event) {
    event.preventDefault();

    var errorType = $(event.target).find(':selected').val();

    remote.error = errorType;
    this.trigger('control:change');
  },

  /**
   * When the drive button got clicked
   * @param  {Event} event The JQuery Event
   */
  onDriveButtonClick: function(event) {
    event.preventDefault();

    if (this.$driveButton.hasClass('cancel')) {
      this.trigger('drive:stop');
    } else {
      this.trigger('drive:start');
    }
  },

  /**
   * When the reset button got clicked
   * @param  {Event} event The JQuery Event
   */
  onResetButtonClick: function(event) {
    event.preventDefault();

    this.trigger('drive:reset');
  },

  /**
   * Update the drive button on drive start
   */
  onDriveStart: function() {
    this.$driveButton.removeClass().addClass('button cancel icon-pause');
  },

  /**
   * Update the drive button on drive stop
   */
  onDriveStop: function() {
    this.$driveButton.removeClass().addClass('button icon-play');
  },

  /**
   * Update the speed when it got changed
   */
  updateSpeed: function() {
    this.speed = this.$speedSlider.val();

    this.$speedDisplay.html(this.speed);
    this.trigger('speed:change', this.speed);
  },

  /**
   * Update the accuracy when it got changed
   */
  updateAccuracy: function() {
    var accuracy = this.$accuracySlider.val();

    this.$accuracyDisplay.html(accuracy);
    this.trigger('accuracy:change', accuracy);
  },

  /**
   * Initialize the autocomplete for the passed element
   * @param  {google.maps.Map} map The map to use
   * @param  {String} elemId  The id of the autocomplete element
   */
  initAutocomplete: function(map, elemId) {
    var input = document.getElementById(elemId),
      autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', map);

    google.maps.event.addListener(
      autocomplete,
      'place_changed',
      _.bind(function() {
        this.trigger('place:change', {
          type: elemId,
          place: autocomplete.getPlace()
        });
      },
      this)
    );
  },

  /**
   * When the search query got updated
   */
  updateSearchQuery: function() {
    var $webappControl = $('.webapp'),
    $webappUrlInput = $webappControl.find('.url');

    $('.set-webapp').on('click', _.bind(function() {
      this.trigger('searchQuery:change', $webappUrlInput.val());
    }, this));
  }
});

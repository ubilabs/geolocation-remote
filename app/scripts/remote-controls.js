// The control elements in the remote
var ControlsModel = Model({
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
    this.$isOnline = this.$controls.find('.is-online input');

    this.$speedSlider.on('change', this.updateSpeed);
    this.$accuracySlider.on('change', this.updateAccuracy);
    this.$driveButton.on('click', this.onDriveButtonClick);
    this.$resetButton.on('click', this.onResetButtonClick);
    this.$gpsError.on('change', this.setGpsError);
    this.$isOnline.on('change', this.setOnline);

    this.initAutocomplete(remote.map.map, 'from');
    this.initAutocomplete(remote.map.map, 'to');
  },

  enable: function () {
    $.each(this.$controlItems, this.enableControl);
  },

  enableControl: function (i, e) {
    $(e).removeAttr("disabled");
  },

  disable: function () {
    $.each(this.$controlItems, this.disableControl);
  },

  disableControl: function (i, e) {
    $(e).attr("disabled",'disabled');
  },

  setOnline: function () {
    var isOnline = $(event.target).is(':checked');
    remote.onLine = isOnline;

    updateWebapp();
  },

  setGpsError: function (event) {
    event.preventDefault();
    var errorType = $(event.target).find(":selected").val();
    remote.error = errorType;

    updateWebapp();
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
    var speed = this.$speedSlider.val();

    this.$speedDisplay.html(speed);
    this.trigger('speed:changed', {speed: speed});
  },

  updateAccuracy: function() {
    var accuracy = this.$accuracySlider.val();

    this.$accuracyDisplay.html(accuracy);
    this.trigger('accuracy:changed', {accuracy: accuracy});
    updateWebapp();
  },

  initAutocomplete: function(map, elemId) {
    var input = document.getElementById(elemId),
      autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', map);

    google.maps.event.addListener(autocomplete, 'place_changed', _.bind(function () {
      this.trigger('place:changed', {
        type: elemId,
        place: autocomplete.getPlace()
     })
    }, this));
  }
});
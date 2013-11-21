window.remote = window.remote || {};

/**
 * The pois on the map
 */
remote.Poi = new Model({
  /**
   * The content of the infowindow
   * @type {String}
   */
  contentString: '',

  /**
   * Initialize
   * @param  {Object} data Data of the poi
   * @param  {google.maps.Map} map The map the poi is shown on
   * @return {google.maps.Marker} The pois Marker
   */
  init: function(data, map) {
    this.map = map.map;
    this.data = data;
    this.infoWindow = map.infoWindow;

    this.poiMarker = new google.maps.Marker({
      map: this.map,
      position: new google.maps.LatLng(this.data.latitude, this.data.longitude)
    });

    this.addPoiInfo();

    google.maps.event.addListener(
      this.poiMarker,
      'mouseover',
      this.openPoiInfo
    );
    google.maps.event.addListener(
      this.poiMarker,
      'mouseout',
      this.closePoiInfo
    );

    return this.poiMarker;
  },

  /**
   * Delete the poi
   */
  deletePoi: function() {
    this.poiMarker.setMap(null);
  },

  /**
   * Add info of the poi
   */
  addPoiInfo: function() {
    _.each(this.data, function(value, key) {
      this.contentString += key + ': ' + value + '<br />';
    });
  },

  /**
   * Open the poi infowindow
   */
  openPoiInfo: function() {
    this.infoWindow.setContent(this.contentString);
    this.infoWindow.setPosition(this.poiMarker.getPosition());

    this.infoWindow.open(this.map);
  },

  /**
   * Close the poi infowindow
   */
  closePoiInfo: function() {
    this.infoWindow.close();
  }
});

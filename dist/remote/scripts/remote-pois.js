var Pois = Model({

  contentString: '',

  init: function (poi, map) {

    this.map = map.map;
    this.poi = poi;
    this.infoWindow = map.infoWindow;

    this.poiMarker = new google.maps.Marker({
      map: this.map,
      position: new google.maps.LatLng(poi.latitude, poi.longitude)
    });

    this.addPoiInfo();

    google.maps.event.addListener(this.poiMarker, 'mouseover', this.openPoiInfo);
    google.maps.event.addListener(this.poiMarker, 'mouseout', this.closePoiInfo);

    return this.poiMarker;
  },

  deletePoi: function() {
    this.poiMarker.setMap(null);
  },

  addPoiInfo: function () {
    _.each(this.poi, function (value, key) {
      this.contentString += key + ": " + value + "<br />";
    })

    console.log(this.contentString);
  },

  openPoiInfo: function () {
    console.log('hver')
    this.infoWindow.setContent(this.contentString);
    this.infoWindow.setPosition(this.poiMarker.getPosition());

    this.infoWindow.open(this.map);
  },

  closePoiInfo: function () {
    this.infoWindow.close();
  }
});
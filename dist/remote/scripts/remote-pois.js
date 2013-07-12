var Pois = Model({


  init: function (poi, map) {

    this.map = map;
    this.poi = poi;

    this.poiMarker = new google.maps.Marker({
      map: map,
      icon: '/images/ghost_default.png',
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
    var contentString = '';

    this.infowindow = new google.maps.InfoWindow();

    _.each(this.poi, function (value, key) {
      contentString += key + ": " + value + "<br />";
    })

    this.infowindow.setContent(contentString);
    this.infowindow.setPosition(this.poiMarker.getPosition());

  },

  openPoiInfo: function () {
    this.infowindow.open(this.map);
  },

  closePoiInfo: function () {
    this.infowindow.close();
  }
});
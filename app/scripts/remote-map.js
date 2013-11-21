window.remote = window.remote || {};

// Map to visualize blitzes and center
remote.MapModel = new Model({
  mapOptions: {
    zoom: 14,
    center: new google.maps.LatLng(53.580973, 10.0008938),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    keyboardShortcuts: false
  },
  icons: {
    center: 'images/geolocation-icon.png'
  },
  pois: [],

  init: function() {

    this.map = new google.maps.Map(
      document.getElementById('map_canvas'),
      this.mapOptions
    );

    this.directionsDisplay = new google.maps.DirectionsRenderer({
      draggable: true,
      map: this.map
    });

    this.infoWindow = new google.maps.InfoWindow();

    google.maps.event.addListener(
      this.directionsDisplay,
      'directions_changed',
      this.updateDirection
    );
  },

  /**
   * Add the center marker to the map with the given position
   * @param  {object} position position object with at least valid lat and lng
   */
  addCenter: function(position) {

    position = position || remote.app.position;

    this.latLng = new google.maps.LatLng(position.latitude, position.longitude);
    this.map.setCenter(this.latLng);

    this.centerMarker = new google.maps.Marker({
      map: this.map,
      icon:  {
        url: this.icons.center,
        size: new google.maps.Size(32, 32),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 16),
        scaledSize: new google.maps.Size(32, 32)
      },
      draggable: true,
      raiseOnDrag: false,
      position: this.latLng
    });

    google.maps.event.addListener(
      this.centerMarker,
      'dragend',
      this.updateCenter
    );

    this.centerViewDistance = new google.maps.Circle({
      center: this.latLng,
      strokeColor: 'white',
      map: this.map,
      radius: remote.defaults.distance
    });

    this.centerHeadingLine = new google.maps.Polyline({
      map: this.map,
      strokeColor: 'white',
      geodesic: true,
      path: [this.latLng, google.maps.geometry.spherical.computeOffset(
          this.latLng, remote.defaults.distance, 0
        )]
    });

    this.centerPortLine = new google.maps.Polyline({
      map: this.map,
      strokeColor: 'red',
      geodesic: true,
      path: [this.latLng, google.maps.geometry.spherical.computeOffset(
          this.latLng, remote.defaults.distance, remote.defaults.angle
        )]
    });

    this.centerStarboardLine = new google.maps.Polyline({
      map: this.map,
      strokeColor: 'green',
      geodesic: true,
      path: [this.latLng, google.maps.geometry.spherical.computeOffset(
          this.latLng, remote.defaults.distance, -remote.defaults.angle
        )]
    });

    this.trigger('center:added');
  },

  updateCenter: function(data, centerMap) {
    var offset = google.maps.geometry.spherical.computeOffset,
      heading;

    data = data || this;

    heading = google.maps.geometry.spherical.computeHeading(
      this.latLng, data.latLng
    );

    this.latLng = data.latLng;

    if (centerMap) {
      this.map.setCenter(this.latLng);
    }

    this.centerMarker.setPosition(this.latLng);

    this.centerViewDistance.setCenter(this.latLng);
    this.centerViewDistance.setRadius(remote.defaults.distance);

    this.centerHeadingLine.setPath([this.latLng, offset(
      this.latLng, remote.defaults.distance, heading
    )]);

    this.centerPortLine.setPath([this.latLng, offset(
      this.latLng, remote.defaults.distance, heading + remote.defaults.angle
    )]);

    this.centerStarboardLine.setPath([this.latLng, offset(
      this.latLng, remote.defaults.distance, heading - remote.defaults.angle
    )]);

    remote.app.updatePosition(this.latLng);
    this.trigger('center:updated');
  },

  updateDirection: function() {
    this.trigger('route:changed', this.directionsDisplay);
  },

  updateRoute: function(data) {
    var route = data.route;

    this.directionsDisplay.setDirections(route);
  },

  addPois: function(data) {
    var markerBounds = new google.maps.LatLngBounds();
    this.deletePois();

    markerBounds.extend(this.latLng);

    _.each(data, _.bind(function(poi) {
      var marker = new remote.Pois(poi, this);

      markerBounds.extend(marker.poiMarker.getPosition());
      this.pois.push(marker);
    }, this));

    this.map.fitBounds(markerBounds);
  },

  deletePois: function() {
    _.invoke(this.pois, 'deletePoi');
    this.pois = [];
  }
});

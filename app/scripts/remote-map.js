// Map to visualize blitzes and center
var MapModel = Model({
  mapOptions: {
    zoom: 14,
    center: new google.maps.LatLng(53.580973, 10.0008938),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    keyboardShortcuts: false
  },
  icons: {
    center: '/images/car.png',
    highlight: '/images/highlight_default.png',
    closest: '/images/highlight_closest.png',
    ghost: '/images/ghost_default.png'
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

    google.maps.event.addListener(this.directionsDisplay, 'directions_changed', this.updateDirection);
  },

  addCenter: function(position) {
console.log(position)
    this.latLng = new google.maps.LatLng(position.lat, position.lng);

    this.centerMarker = new google.maps.Marker({
      map: this.map,
      icon: new google.maps.MarkerImage(this.icons.center, null, null, new google.maps.Point(24, 24)),
      draggable: true,
      raiseOnDrag: false,
      position: this.latLng
    });

    google.maps.event.addListener(this.centerMarker, "dragend", this.updateCenter);

    this.centerView = new google.maps.Circle({
      center: this.latLng,
      map: this.map,
      radius: remote.defaults.distance
    });

    this.centerViewLine = new google.maps.Polyline({
      map: this.map,
      geodesic: true,
      path: [this.latLng, google.maps.geometry.spherical.computeOffset(
          this.latLng, remote.defaults.distance, 0
        )]
    });

    this.centerViewLine1 = new google.maps.Polyline({
      map: this.map,
      geodesic: true,
      path: [this.latLng, google.maps.geometry.spherical.computeOffset(
          this.latLng, remote.defaults.distance, remote.defaults.angle
        )]
    });

    this.centerViewLine2 = new google.maps.Polyline({
      map: this.map,
      geodesic: true,
      path: [this.latLng, google.maps.geometry.spherical.computeOffset(
          this.latLng, remote.defaults.distance, -remote.defaults.angle
        )]
    });
  },

  updateCenter: function(data) {

    this.latLng = data.latLng,
      direction = webapp.marker.direction,
      offset = google.maps.geometry.spherical.computeOffset;

    this.centerMarker.setPosition(this.latLng);

    this.centerView.setCenter(this.latLng);

    this.centerViewLine.setPath([this.latLng, offset(
      this.latLng, remote.defaults.distance, direction
    )]);

    this.centerViewLine1.setPath([this.latLng, offset(
      this.latLng, remote.defaults.distance, direction + remote.defaults.angle
    )]);

    this.centerViewLine2.setPath([this.latLng, offset(
      this.latLng, remote.defaults.distance, direction - remote.defaults.angle
    )]);

    updateWebapp();
  },

  updateDirection: function () {
    this.trigger('route:changed', this.directionsDisplay);
  },

  updateRoute: function(data) {
    var route = data.route;

    this.directionsDisplay.setDirections(route);
  },

  addPois: function (data) {
    this.deletePois();

    _.each(data, _.bind(function (poi) {
      this.pois.push(new Pois(poi, this.map));
    }, this));
  },

  deletePois: function () {
    _.invoke(this.pois, 'deletePoi');
    this.pois = [];
  }
});
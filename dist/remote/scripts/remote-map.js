// Map to visualize blitzes and center
var MapModel = Model({
  mapOptions: {
    zoom: 14,
    center: new google.maps.LatLng(53.580973, 10.0008938),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    keyboardShortcuts: false
  },
  icons: {
    center: '/remote/images/geolocation-icon.png'
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

    position = position || remote.app.position;

    this.latLng = new google.maps.LatLng(position.latitude, position.longitude);
    this.map.setCenter(this.latLng);

    this.centerMarker = new google.maps.Marker({
      map: this.map,
      icon:  {
        url: this.icons.center,
        // This marker is 20 pixels wide by 32 pixels tall.
        size: new google.maps.Size(32, 32),
        // The origin for this image is 0,0.
        origin: new google.maps.Point(0,0),
        // The anchor for this image is the base of the flagpole at 0,32.
        anchor: new google.maps.Point(16, 16),
        scaledSize: new google.maps.Size(32, 32)
      },
      draggable: true,
      raiseOnDrag: false,
      position: this.latLng
    });

    google.maps.event.addListener(this.centerMarker, "dragend", this.updateCenter);

    // this.centerView = new google.maps.Circle({
    //   center: this.latLng,
    //   map: this.map,
    //   radius: remote.defaults.distance
    // });

    // this.centerViewLine = new google.maps.Polyline({
    //   map: this.map,
    //   geodesic: true,
    //   path: [this.latLng, google.maps.geometry.spherical.computeOffset(
    //       this.latLng, remote.defaults.distance, 0
    //     )]
    // });

    // this.centerViewLine1 = new google.maps.Polyline({
    //   map: this.map,
    //   geodesic: true,
    //   path: [this.latLng, google.maps.geometry.spherical.computeOffset(
    //       this.latLng, remote.defaults.distance, remote.defaults.angle
    //     )]
    // });

    // this.centerViewLine2 = new google.maps.Polyline({
    //   map: this.map,
    //   geodesic: true,
    //   path: [this.latLng, google.maps.geometry.spherical.computeOffset(
    //       this.latLng, remote.defaults.distance, -remote.defaults.angle
    //     )]
    // });

    this.trigger('center:added');
  },

  updateCenter: function(data, centerMap) {

    this.latLng = data.latLng,
      offset = google.maps.geometry.spherical.computeOffset;

    if (centerMap) {
      this.map.setCenter(this.latLng);
    }

    this.centerMarker.setPosition(this.latLng);

    // this.centerView.setCenter(this.latLng);

    // this.centerViewLine.setPath([this.latLng, offset(
    //   this.latLng, remote.defaults.distance, direction
    // )]);

    // this.centerViewLine1.setPath([this.latLng, offset(
    //   this.latLng, remote.defaults.distance, direction + remote.defaults.angle
    // )]);

    // this.centerViewLine2.setPath([this.latLng, offset(
    //   this.latLng, remote.defaults.distance, direction - remote.defaults.angle
    // )]);

    remote.app.updatePosition(this.latLng);
    this.trigger('center:updated');
  },

  updateDirection: function () {
    this.trigger('route:changed', this.directionsDisplay);
  },

  updateRoute: function(data) {
    var route = data.route;

    this.directionsDisplay.setDirections(route);
  },

  addPois: function (data) {
    var markerBounds = new google.maps.LatLngBounds();
    this.deletePois();

    markerBounds.extend(this.latLng);

    _.each(data, _.bind(function (poi) {
      var marker = new Pois(poi, this.map)
      markerBounds.extend(marker.poiMarker.getPosition());
      this.pois.push(marker);
    }, this));

    this.map.fitBounds(markerBounds);
  },

  deletePois: function () {
    _.invoke(this.pois, 'deletePoi');
    this.pois = [];
  }
});
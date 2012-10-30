# Geolocation Remote 
### Control the Location of Your Mobile Device

It is hard to test mobile applications where the location changes freequently. This tool lets you take over control of your `navigator.geolocation` by overriding the existing APIs using data from a simple socket connection.

## Installation

1. Download or clone this repository.
2. Make sure [Node.js](http://nodejs.org/) is installed.
3. Install all dependencies using `npm install`.
4. Start the socket connection: `node socket.js`.

## Run the Examples

### Simple 

1. Open the _examples/simple/index.html_ on you mobile phone.
2. Open the same document in your desktop browser.
3. Drag the marker around and see it synced to your mobile.

### Advanced 

1. Open the _examples/simple/index.html_ on you mobile phone.
2. Open the _examples/advanced/index.html_ in your desktop browser.
3. Drag the marker around and see it synced to your mobile.
4. Define a route and click play to see the marker move along the route.

## Screenshot

![Geolocation Remote](https://raw.github.com/ubilabs/geolocation-remote/master/screenshot.png)

## Usage

```js
// create the geolocation remote by passing the socket URL
var geolocation = geolocationRemote("http://localhost:8888");
```

The `geolocation` object provides the same methods as the default `navigator.geolocation`:

* `getCurrentPosition(success, error, options)` - Get the current position.
* `watchPosition(success, error, options)` - Watch for updates.
* `clearWatch(id)` - Remove old listeners

Additionally it provides a `updatePosition` method to update the position on all connected devices:

```js
geolocation.updatePosition({latitide: 12, longitude: 23, accuracy: 34 });
``` 


## Example Code

```js

var map = new google.maps.Map( ... ),
  marker = new google.maps.Marker({ ... }),
  geolocation = geolocationRemote("http://localhost:8888");

// set position updates to all connected clients
google.maps.event.addListener(marker, "drag", function(event){
  var position = event.latLng;

  geolocation.updatePosition({
    latitude: position.lat(),
    longitude: position.lng(),
    accuracy: 10
  });
});

// update marker position when an update arrives
geolocation.watchPosition(function(position){
  marker.setPosition(new google.maps.LatLng(
    position.coords.latitude,
    position.coords.longitude
  ));
});
```

## About

Developed by [Martin Kleppe](http://twitter.com/aemkei) at [Ubilabs](http://ubilabs.net).

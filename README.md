# Geolocation Remote 
### Control the Location of Your Mobile Device

It is hard to test mobile applications where the location changes freequently. This tool lets you take over control of your `navigator.geolocation` by overriding the existing APIs using data from a simple socket connection.

This a small app to run a geolocation webapp in the browser with debugging possibilities. The webapp in question is inserted as an iframe and the geolocation api is overwritten to use the one we provide. This one is build to work with google maps to show where exactly we are now in the webapp. 

## Installation

For now you have to clone the project rum npm install, bower install and grunt build. Copy the contents of the dist folder to your webapp root and access you webapp with http://[webapp root]/remote.

Add client-scripts.js in the remote scripts folder to tweak your app behaviour. It is for for use of your own scripts. The default one is not used for the build allthough you could just copy it as a starting point.


## About

Developed by [Martin Kleppe](http://twitter.com/aemkei) at [Ubilabs](http://ubilabs.net).

TODO: 
* Put the debug info out of the iframe. with parent client communication and stuff maybe ...
* resizeable iFrame
* make log more usefull. with scrolling and not overflowing ...
* nicerer infoWindow

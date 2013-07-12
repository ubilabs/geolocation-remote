var debugDivs = ['log', 'position', 'error', 'online'], div, elem;

var debugContainer = document.createElement('div');
debugContainer.id = 'debug';
document.body.appendChild(debugContainer);


for (var i = debugDivs.length - 1; i >= 0; i--) {
  div = debugDivs[i];
  elem = document.createElement('div');
  elem.id = div;
  debugContainer.appendChild(elem);
};

var positionDiv = document.getElementById('position'),
  logDiv = document.getElementById('log'),
  errorDiv = document.getElementById('error'),
  onlineDiv = document.getElementById('online'),
  watchId = '';

testGetCurrentPosition = function() {
  navigator.geolocation.getCurrentPosition(success, error);
}

testWatchPosition = function() {

  if (watchId != '') {
    navigator.geolocation.clearWatch(watchId);
    watchId = '';
  } else {
    watchId = navigator.geolocation.watchPosition(success, error);
  }

}

success = function(position) {
  updatePosition(position);
}

error = function(error) {
  errorDiv.innerHTML = JSON.stringify(error);
}

updatePosition = function(position) {
  msg = '<code data-language="javascript">' + JSON.stringify(position) + '</code>';
  positionDiv.innerHTML = msg;
}

// check if online or not
setInterval(function() {
  if (window.navigator.onLine) {
    onlineDiv.innerHTML = 'online'
  } else {
    onlineDiv.innerHTML = 'offline'
  }
}, 1000);

// overwrite console.log
konsole = console;

console = {
  log: function(log) {
    logDiv.innerHTML += log + ' ' + new Date().toISOString() + '<br><br>';
    konsole.log(log)
    parent.postMessage(log, window.location.origin + '/remote');
  }
}

// add click event listener
var getCurrentButton = document.getElementsByClassName('get-current-position')[0];

if (getCurrentButton) {
  getCurrentButton.addEventListener('click', testGetCurrentPosition);
}

var watchButton = document.getElementsByClassName('watch-positions')[0];

if (getCurrentButton) {
  getCurrentButton.addEventListener('click', testWatchPosition);
}

// add here what you need you app to do after the fake navigator is loaded
// i.e. restart the watchPosition function
// send poi infomations to the remote control


// app.init(); // maybe this one calls watchPosition()

// if (navigator.geolocation.sendToRemote) {

//   // You may want to add your own initial center marker. do it here
//   // You can set options too

//   navigator.geolocation.sendToRemote({
//     init: true,
//     position: {
//       lat: 53.580973,
//       lng: 10.0008938
//     },
//     options: {
//       distance: 5000,
//       angle: 90
//     }
//   });

//   // you maybe have events with data that would be nice to have in the Remote control
//   // pois.on('pois:loaded', sendPois);
// }

// add data to remote control. This is a way to remote control the remote control
// for poi data we need at least latitude and longitude values in the object. 
// everything else is shown in the infowindow for each poi
//
// {
//   "latitude":53.624603,
//   "longitude":10.08484,
//   "address_street": "B434 Bramfelder Chaussee 423",
//   "permanent": true,
//   "id": 752392,
// }

// function sendPois (data) {
//   navigator.geolocation.sendToRemote(data);
// }
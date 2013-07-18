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
    console.log('webapp reset watchID: ' + watchId);

    watchId = '';
  } else {
    watchId = navigator.geolocation.watchPosition(success, error);
    console.log('webapp got watchID: ' + watchId);
  }

}

success = function(position) {
  console.log('Webapp got: ' + JSON.stringify(position));
  updatePosition(position);
}

error = function(error) {
  errorDiv.innerHTML = JSON.stringify(error);
}

updatePosition = function(position) {
  msg = '<div class="log-message">' + JSON.stringify(position) + '</div>';
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
    logDiv.innerHTML += '<div class="log-message">' + log + ' ' + new Date().toISOString() + '</div>';
    konsole.log(log)
    parent.postMessage(log, window.location.origin + '/remote');
  }
}

// add click event listener
var getCurrentButton = document.getElementsByClassName('get-current-position')[0];

if (getCurrentButton) {
  getCurrentButton.addEventListener('click', testGetCurrentPosition);
}

var watchButton = document.getElementsByClassName('watch-position')[0];

if (watchButton) {
  watchButton.addEventListener('click', testWatchPosition);
}

// add here what you need you app to do after the fake navigator is loaded
// i.e. restart the watchPosition function
// send poi infomations to the remote control


// app.init(); // maybe this one calls watchPosition()

if (navigator.geolocation.sendToRemote) {

  // You may want to add your own initial center marker. do it here
  // You can set options too

  navigator.geolocation.sendToRemote({
    init: true,
    position: {
      lat: 53.580973,
      lng: 10.0008938
    },
    options: {
      distance: 5000,
      angle: 90
    }
  });

  var data = {
    pois: [
      {
        "latitude": 53.545592,
        "longitude": 9.952519,
        "address_street": "Fischmarkt, Hamburg"
      },{
        "latitude": 53.548333,
        "longitude": 9.978889,
        "address_street": "St. Michael's Church, Hamburg"
      },{
        "latitude": 53.5502,
        "longitude": 9.9922,
        "address_street": "Hamburg Rathaus"
      },{
        "latitude": 53.545834,
        "longitude": 9.966531,
        "address_street": "Alter Elbtunnel, Hamburg"
      },{
        "latitude": 53.561027,
        "longitude": 9.961437,
        "address_street": "Julius Strasse 25, Hamburg"
      }
    ]
  }
  sendPois(data);
}

// add data to remote control. This is a way to remote control the remote control
// for poi data we need at least latitude and longitude values in the object. 
// everything else is shown in the infowindow for each poi

// {
//   "latitude":53.624603,
//   "longitude":10.08484,
//   "address_street": "B434 Bramfelder Chaussee 423",
//   "permanent": true,
//   "id": 752392,
// }

function sendPois (data) {
  navigator.geolocation.sendToRemote(data);
}
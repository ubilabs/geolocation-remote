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
    logDiv.innerHTML = log + new Date();
    konsole.log(log)
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

var debugDivs = ['log', 'position', 'error', 'online'],
  debugContainer = document.createElement('div'),
  watchId = '',
  div, elem, positionDiv, logDiv, errorDiv, onlineDiv;

debugContainer.id = 'debug';
document.body.appendChild(debugContainer);

for (var i = debugDivs.length - 1; i >= 0; i--) {
  div = debugDivs[i];
  elem = document.createElement('div');
  elem.id = div;
  debugContainer.appendChild(elem);
}

positionDiv = document.getElementById('position');
logDiv = document.getElementById('log');
errorDiv = document.getElementById('error');
onlineDiv = document.getElementById('online');

window.testGetCurrentPosition = function() {
  window.navigator.geolocation.getCurrentPosition(window.success, window.error);
};

window.testWatchPosition = function() {
  if (watchId !== '') {
    window.navigator.geolocation.clearWatch(watchId);
    console.log('webapp reset watchID: ' + watchId);

    watchId = '';
  } else {
    watchId = window.navigator.geolocation.watchPosition(window.success, window.error);
    console.log('webapp got watchID: ' + watchId);
  }
};

window.success = function(position) {
  console.log('Webapp got: ' + JSON.stringify(position));
  window.updatePosition(position);
};

window.error = function(error) {
  errorDiv.innerHTML = JSON.stringify(error);
};

window.updatePosition = function(position) {
  var msg = '<div class="log-message">' + JSON.stringify(position) + '</div>';
  positionDiv.innerHTML = msg;
};

/**
 * check if online or not
 */
setInterval(function() {
  if (window.navigator.onLine) {
    onlineDiv.innerHTML = 'online';
  } else {
    onlineDiv.innerHTML = 'offline';
  }
}, 1000);

/**
 * overwrite console.log
 */
window.konsole = console;
window.console = {
  log: function(log) {
    var data = {
      log: log
    };

    logDiv.innerHTML += '<div class="log-message">' + log + ' ' +
      new Date().toISOString() + '</div>';

    parent.postMessage(data, window.location.origin + '/remote');
  }
};

/**
 * add click event listener
 */
var currentButton = document.getElementsByClassName('get-current-position')[0];

if (currentButton) {
  currentButton.addEventListener('click', window.testGetCurrentPosition);
}

var watchButton = document.getElementsByClassName('watch-position')[0];

if (watchButton) {
  watchButton.addEventListener('click', window.testWatchPosition);
}

// add data to remote control. This is a way to remote control the remote
// control for poi data we need at least latitude and longitude values in the
// object. everything else is shown in the infowindow for each poi

// data = {
//  pois: [
//    {
//       'latitude': 53.624603,
//       'longitude': 10.08484,
//       'address_street': 'B434 Bramfelder Chaussee 423',
//       'id': 752392,
//     }
//   ],
//   options: {
//     distance: 500
//   }
// }
window.sendPois = function(data) {
  window.navigator.geolocation.sendToRemote(data);
};

// add here what you need you app to do after the fake navigator is loaded
// i.e. restart the watchPosition function
// send poi infomations to the remote control

// app.init(); // maybe this one calls watchPosition()

if (window.navigator.geolocation.sendToRemote) {
  // You may want to add your own initial center marker. do it here
  // You can set options too
  window.navigator.geolocation.sendToRemote({
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
        'latitude': 53.545592,
        'longitude': 9.952519,
        'address_street': 'Fischmarkt, Hamburg'
      }, {
        'latitude': 53.548333,
        'longitude': 9.978889,
        'address_street': 'St. Michael\'s Church, Hamburg'
      }, {
        'latitude': 53.5502,
        'longitude': 9.9922,
        'address_street': 'Hamburg Rathaus'
      }, {
        'latitude': 53.545834,
        'longitude': 9.966531,
        'address_street': 'Alter Elbtunnel, Hamburg'
      }, {
        'latitude': 53.561027,
        'longitude': 9.961437,
        'address_street': 'Julius Strasse 25, Hamburg'
      }
    ],
    log: 'Sent pois',
    options: {
      distance: 500
    }
  };

  window.sendPois(data);
}

var RemoteLog = Model({

  logQueue: {},
  logContainers: {
    clientLog: document.getElementById('client-log'),
    rcLog: document.getElementById('rc-log')
  },

  init: function() {
    window.addEventListener("message", this.receiveMessage, false);
  },

  receiveMessage: function(event)
  {
    if (event.origin !== window.location.origin)
      return;

    this.addToLogQueue('clientLog', event.data);
    this.updateLog('clientLog');
  },

  addToLogQueue: function(logType, msg) {
    var logQueue = this.logQueue[logType] || [];

    logQueue = logQueue.slice(1, 3)
    logQueue.push(msg);

    this.logQueue[logType] = logQueue;
  },

  updateLog: function(logType) {
    var logDiv = this.logContainers[logType],
      logQueue = this.logQueue[logType];

    logDiv.innerHTML = '';

    for (var i = logQueue.length - 1; i >= 0; i--) {
      logDiv.innerHTML += logQueue[i] + '<br>';
    };
  },

  log: function (logType, msg) {
    
  }
});
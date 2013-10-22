var RemoteLog = Model({

  logQueue: {},
  logContainers: {
    clientLog: document.querySelector('#client-log'),
    rcLog: document.querySelector('#rc-log')
  },

  receiveMessage: function(logType, msg)
  {
    this.addToLogQueue(logType, msg);
    this.updateLog(logType);
  },

  addToLogQueue: function(logType, msg) {
    var logQueue = this.logQueue[logType] || [];

    logQueue.push(msg.substring(0,200));

    if (logQueue.length>=4) {
      logQueue = logQueue.slice(1, 4)
    }

    this.logQueue[logType] = logQueue;
  },

  updateLog: function(logType) {
    var logDiv = this.logContainers[logType],
      logQueue = this.logQueue[logType];

    logDiv.innerHTML = '';

    for (var i = logQueue.length - 1; i >= 0; i--) {
      logDiv.innerHTML += '<div class="log-message">' + logQueue[i] + '</div>';
    };
  }
});
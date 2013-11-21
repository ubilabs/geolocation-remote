window.remote = window.remote || {};

remote.Log = new Model({
  /**
   * Contains the client and remote control (rc) log container elements
   * @type {Object}
   */
  logContainers: {
    clientLog: document.querySelector('#client-log'),
    rcLog: document.querySelector('#rc-log')
  },

  /**
   * Initialize
   */
  init: function() {
    this.queue = {};
  },

  /**
   * Receive a message to log for the remote control
   * @param  {String} msg  The log message
   */
  rc: function(msg) {
    this.addToQueue('rcLog', msg);
    this.updateLog('rcLog');
  },

  /**
   * Receive a message to log for the client
   * @param  {String} msg  The log message
   */
  client: function(msg) {
    this.addToQueue('clientLog', msg);
    this.updateLog('clientLog');
  },

  /**
   * Add a message to the queue
   * @param  {String} logType The type (clientLog or rcLog)
   * @param  {String} msg     The log message
   */
  addToQueue: function(logType, msg) {
    var queue = this.queue[logType] || [];

    queue.push(msg.substring(0, 200));

    if (queue.length >= 4) {
      queue = queue.slice(1, 4);
    }

    this.queue[logType] = queue;
  },

  /**
   * Rerender a log container
   * @param  {String} logType The type (clientLog or rcLog)
   */
  updateLog: function(logType) {
    var logDiv = this.logContainers[logType],
      queue = this.queue[logType],
      i;

    logDiv.innerHTML = '';

    for (i = queue.length - 1; i >= 0; i--) {
      logDiv.innerHTML += '<div class="log-message">' + queue[i] + '</div>';
    }
  }
});

var net = require('net')
module.exports = function (_config) { // sidecar log factory
  var config = Object.assign({
    // Where the socket server is hosted
    host: '127.0.0.1',
    // The port the socket server listens on
    port: 5678,
    // whether the logging should be asynchronous or not
    async: false,
    // reconnect interval
    reconnectInterval: 500,
    // how many times to retry in case of connection failure
    maxRetries: 0
  }, _config)
  // some validations
  if (typeof config.async !== 'boolean') {
    throw new Error('Sidecar client async configuration property must be boolean')
  } else if (typeof config.reconnectInterval !== 'number') {
    throw new Error('Sidecar client reconnectInterval configuration property must be a number')
  } else if (typeof config.maxRetries !== 'number') {
    throw new Error('Sidecar client maxRetries configuration property must be a number')
  }
  var client
  var connected = false
  function connect () {
    return new Promise(function (resolve, reject) {
      if (connected) {
        return resolve()
      }
      var resolved = false
      client = new net.Socket()
      client.on('connect', function () {
        connected = true
        if (!resolved) {
          resolved = true
          resolve()
        }
      })
      client.on('error', function (e) {
        connected = false
        if (!resolved) {
          resolved = true
          reject(e)
        }
      })
      client.on('close', function () {
        connected = false
        if (!resolved) {
          resolved = true
          reject(new Error('connection couldn\'t be established'))
        }
      })
      client.connect({
        host: config.host,
        port: config.port
      })
    })
  }
  return {
    log: function (msg) {
      msg.time = new Date()
      var retries = 0
      function log (msg) {
        return connect()
          .then(function () {
            return client.write(JSON.stringify(msg))
          })
          .catch(function (e) {
            if (config.reconnectInterval && retries++ < config.maxRetries) {
              return new Promise(function (resolve, reject) {
                setTimeout(function () {
                  resolve(log(msg))
                }, config.reconnectInterval)
              })
            }
            throw e
          })
      }
      if (config.async) {
        process.nextTick(function () {
          log(msg)
            // add catch so that 'unhandled promise rejection' error doesn't get thrown
            .catch(function () {
              // do something fancy
            })
        })
      }
      return log(msg)
    }
  }
}

var sidecarClient = require('./sidecarClient')
var log = function (msg) {
  return msg
}
module.exports = {
  init: function (bus) {
    if (bus.config.forensic) {
      log = sidecarClient(bus.config.forensic).log
    }
  },
  log: function (msg) {
    return log(msg)
  }
}

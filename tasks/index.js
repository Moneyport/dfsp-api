var started = false
var tasks = {
  scheduleBulkPayments: require('./scheduleBulkPayments'),
  postUsers: require('./postUsers'),
  postRules: require('./postRules')
}

module.exports = function (app) {
  if (!started) {
    started = true
    Object.keys(app.config.tasks).forEach(function (task) {
      if (app.config.tasks[task] && tasks[task]) {
        var config = app.config.tasks[task]
        var interval = (config.interval || 10) * 1000
        var end = config.duration ? (new Date(Date.now() + config.duration * 1000)).getTime() : false
        var recurse = function recurse () {
          setTimeout(function () {
            tasks[task](app.bus)
              .catch(() => true)
              .then((proceed) => {
                return (proceed !== false && (!end || Date.now() < end)) ? recurse() : {}
              })
          }, interval)
        }
        recurse()
      }
    })
  }
  return app
}

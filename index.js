var runTasks = require('./tasks')
module.exports = require('ut-run')
  .run({}, module)
  .then(runTasks)
  .then((app) => {
    return app.bus.importMethod('forensic.log')({
      message: 'DFSP Api up and running',
      config: JSON.parse(JSON.stringify(app.config, function (key, value) {
        if (key === 'stream') {
          return value.constructor.name
        }
        return value
      }))
    })
      .then(() => app)
      .catch(() => app)
  })

module.exports = require('../../resthooks')([
  require('./batch.check'),
  require('./payment.process')
])

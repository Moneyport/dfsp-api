module.exports = require('../../resthooks')([
  require('./add'),
  require('./get'),
  require('./getData')
])

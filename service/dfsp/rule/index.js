module.exports = require('../../resthooks')([
  require('./decision.fetch'),
  require('./quote.get'),
  require('./item.fetch')
])

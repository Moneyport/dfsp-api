module.exports = require('../../resthooks')([
  require('./account.get'),
  require('./account.fetch'),
  require('./transfer.notify'),
  require('./quote.add')
])

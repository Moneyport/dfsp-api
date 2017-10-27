module.exports = require('../../resthooks')([
  require('./actorAccount.add'),
  require('./actorAccount.remove')
])

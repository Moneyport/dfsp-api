module.exports = require('../../resthooks')([
  require('./user.add'),
  require('./user.get')
])

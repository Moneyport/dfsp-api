module.exports = require('../dfspClient')({
  id: 'account',
  createPort: require('ut-port-jsonrpc'),
  url: 'http://localhost:8009',
  namespace: ['dfsp/account'],
  logLevel: 'debug',
  method: 'post'
})

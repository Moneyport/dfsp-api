module.exports = require('../dfspClient')({
  id: 'subscription',
  createPort: require('ut-port-jsonrpc'),
  url: 'http://localhost:8017',
  namespace: ['dfsp/subscription', 'dfsp/notification'],
  logLevel: 'debug',
  method: 'post'
})

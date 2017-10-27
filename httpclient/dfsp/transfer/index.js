module.exports = require('../dfspClient')({
  id: 'transfer',
  createPort: require('ut-port-jsonrpc'),
  url: 'http://localhost:8018',
  namespace: ['dfsp/transfer', 'dfsp/bulk'],
  logLevel: 'debug',
  method: 'post'
})

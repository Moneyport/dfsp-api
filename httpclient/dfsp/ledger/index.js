module.exports = require('../dfspClient')({
  id: 'ledger',
  createPort: require('ut-port-jsonrpc'),
  url: 'http://localhost:8014',
  namespace: ['dfsp/ledger'],
  logLevel: 'debug',
  method: 'post'
})

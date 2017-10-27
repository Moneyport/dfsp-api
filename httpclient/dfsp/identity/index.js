module.exports = require('../dfspClient')({
  id: 'identity',
  createPort: require('ut-port-jsonrpc'),
  url: 'http://localhost:8012',
  namespace: ['dfsp/identity'],
  logLevel: 'debug',
  method: 'post'
})

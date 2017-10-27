module.exports = require('../dfspClient')({
  id: 'directory',
  createPort: require('ut-port-jsonrpc'),
  url: 'http://localhost:8011',
  namespace: ['dfsp/directory'],
  logLevel: 'debug',
  method: 'post'
})

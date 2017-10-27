module.exports = {
  ports: [{
    id: 'jsonrpc',
    createPort: require('ut-port-jsonrpc'),
    logLevel: 'error',
    uri: '/rpc',
    url: 'http://127.0.0.1:8010',
    method: 'post',
    namespace: [
       // custom
      'wallet',
      'payee',
      'samples',
      // dfsp
      'identity',
      'account',
      'directory',
      'ledger',
      'notification',
      'subscription',
      'rule',
      'transfer',
      'bulk',
      'spsp',
      'ist',
      // v1
      'pendingTransactionsApi',
      'invoiceApi'
    ]
  }],
  modules: {}
}
// module.exports = {
//   ports: [{
//     id: 'jsonrpc',
//     headers: {
//       Authorization: 'Basic ' + new Buffer('test' + ':' + '123').toString('base64')
//     },
//     createPort: require('ut-port-jsonrpc')
//   }],
//   modules: {}
// }

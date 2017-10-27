module.exports = {
  id: 'v1',
  createPort: require('ut-port-script'),
  imports: [
    'pendingTransactionsApi',
    'invoiceApi'
  ],
  logLevel: 'trace'
}

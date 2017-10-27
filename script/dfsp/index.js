var bus
var cacheCollection
var tranCount = 0
module.exports = {
  id: 'dfsp',
  createPort: require('ut-port-script'),
  imports: [
    'identity',
    'account',
    'directory',
    'ledger',
    'notification',
    'subscription',
    'rule',
    'transfer',
    'bulk'
  ],
  cacheableMethods: [
    'identity.role.fetch',
    'ledger.transferType.fetch',
    'bulk.batchStatus.fetch',
    'bulk.paymentStatus.fetch',
    'ledger.accountType.fetch',
    'transfer.invoiceType.fetch',
    'notification.channel.get',
    'notification.operation.get',
    'notification.target.get'
  ],
  logLevel: 'trace',
  start: function () {
    bus = this.bus
    cacheCollection = this.bus.importMethod('cache.collection')('dfsp')
  },
  exec: function (msg, $meta) {
    if (~this.config.cacheableMethods.indexOf($meta.method)) {
      return cacheCollection.then((cache) => {
        return cache.get($meta.method)
        .then((res) => {
          if (!res) {
            return bus.importMethod('dfsp/' + $meta.method)(msg)
              .then((r) => {
                return cache.set($meta.method, r)
              })
          }
          return res
        })
      })
    }
    return bus.importMethod('dfsp/' + $meta.method)(msg)
  },
  'bulk.payment.getForProcessing': function (msg, $meta) {
    if (tranCount === 0) {
      return bus.importMethod('dfsp/bulk.payment.getForProcessing')(msg)
    }
    return []
  },
  'bulk.payment.execute': function (msg, $meta) {
    if (tranCount === 0) {
      return this.bus.importMethod('bulk.payment.process')(msg, $meta)
    }
    return {}
  },
  'transfer.push.execute': function (msg, $meta) {
    tranCount++
    var memo = {}
    if (msg.memo) {
      memo = msg.memo
      memo.debitIdentifier = msg.sourceIdentifier
    }
    return this.bus.importMethod('spsp.transfer.transfer.execute')({
      // receiver: msg.receiver,
      // sourceAccount: msg.sourceAccount,
      // destinationAmount: Number(msg.destinationAmount).toFixed(2),
      // memo: JSON.stringify(memo),
      // sourceIdentifier: msg.sourceIdentifier,
      // sourceAmount: (Number(msg.destinationAmount) + Number(msg.fee || 0)).toFixed(2)
      paymentId: msg.paymentId,
      sourceAccount: msg.sourceAccount,
      sourceAmount: (Number(msg.destinationAmount)).toFixed(2),
      ipr: msg.ipr,
      sourceExpiryDuration: msg.sourceExpiryDuration,
      connectorAccount: msg.connectorAccount
    })
    .then((result) => {
      return this.bus.importMethod('notification.notification.add')({
        channel: 'sms',
        operation: msg.transferType,
        target: 'source',
        identifier: msg.sourceIdentifier,
        params: {
          amount: msg.destinationAmount,
          currency: msg.currency
        }
      })
      .then(() => {
        tranCount--
        return result
      })
    })
    .catch((err) => {
      tranCount--
      throw err
    })
  }
}

var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'ledger.transfer.notify',
    path: '/payments/{paymentId}',
    config: {
      description: 'Submit payment notification',
      notes: 'Submit payment notification',
      tags: ['api'],
      validate: {
        params: joi.object({
          paymentId: joi.string().description('paymentId').example('26711806-64a1-4196-85dd-37c64b61bb80')
        }),
        payload: joi.object({
          status: joi.string().description('status').example('prepared')
        }).unknown()
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Payment notification submited',
              schema: joi.string()
            }
          }
        }
      }
    },
    method: 'put'
  },
  'transfer.notify': function (msg, $meta) {
    return this.bus.importMethod('ledger.quote.edit')(
      Object.assign({paymentId: msg.paymentId}, JSON.parse(msg.data))
    )
    .catch(() => false)
    .then((quote) => {
      if (!quote || !quote.identifier) {
        return {}
      }
      let promise = Promise.resolve()
      if ((quote.transferType === 'invoice' || quote.transferType === 'cashOut') && quote.params && quote.params.invoiceId) {
        promise = promise.then(() => {
          return this.bus.importMethod('transfer.invoice.execute')({
            invoiceId: quote.params.invoiceId,
            identifier: quote.identifier
          })
        })
      }
      return promise.then(() => {
        return this.bus.importMethod('notification.notification.add')({
          channel: 'sms',
          operation: quote.transferType,
          target: 'destination',
          identifier: quote.identifier,
          params: {
            amount: quote.amount,
            currency: quote.currencyId
          }
        })
      })
      .then(() => ({}))
      .catch(() => ({}))
    })
  }
}

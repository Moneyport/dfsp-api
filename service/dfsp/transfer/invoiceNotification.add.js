var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'transfer.invoiceNotification.add',
    path: '/invoices',
    reply: (reply, response, $meta) => {
      if (!response.error) {
        return reply(null, null, 201)
      }
      return reply({
        id: response.error.type,
        message: response.error.message
      }, {
        'content-type': 'application/json'
      }, (response.debug && response.debug.statusCode) || 400)
    },
    config: {
      description: 'Add invoice notification',
      notes: 'Add invoice notification',
      tags: ['api', 'spsp-server-backend'],
      validate: {
        payload: joi.object({
          invoiceUrl: joi.string().description('Invoice URL'),
          senderIdentifier: joi.string().description('Client identifier'),
          memo: joi.string().description('memo')
        }).unknown()
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'Invoice notification added successfully',
              schema: joi.any()
            }
          }
        }
      }
    },
    method: 'post'
  },
  'invoiceNotification.add': function (msg, $meta) {
    try {
      var memo = JSON.parse(msg.memo)
      if (memo.status === 'cancelled') {
        $meta.method = 'transfer.invoiceNotification.cancel'
      }
    } catch (e) {}

    return this.config.exec.call(this, {
      invoiceUrl: msg.invoiceUrl,
      identifier: msg.senderIdentifier,
      memo: msg.memo
    }, $meta)
    .then((res) => {
      return this.bus.importMethod('spsp.transfer.invoice.get')({
        receiver: msg.invoiceUrl
      })
      .then((result) => {
        return this.bus.importMethod('notification.notification.add')({
          channel: 'sms',
          operation: $meta.method === 'transfer.invoiceNotification.cancel' === 'cancelled' ? 'invoiceCancel' : result.type,
          target: 'destination',
          identifier: res.identifier,
          params: {
            amount: result.amount,
            currency: result.currencyCode
          }
        })
        .then(() => res)
      })
    })
  }
}

var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'transfer.invoice.execute',
    path: '/invoices/{invoiceId}',
    config: {
      description: 'Approve an invoice transfer',
      notes: 'Approve an invoice transfer',
      tags: ['api'],
      validate: {
        params: joi.object({
          invoiceId: joi.string().description('Invoice Id')
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Invoice approved',
              schema: joi.object().keys({
                senderIdentifier: joi.string().description('Sender Identifier'),
                status: joi.string().description('Status')
              })
            }
          }
        }
      }
    },
    method: 'put'
  },
  'invoice.execute': function (msg, $meta) {
    return this.config.exec.call(this, {
      invoiceId: msg.invoiceId,
      identifier: msg.identifier
    }, $meta)
      .then((result) => {
        return {
          senderIdentifier: result.identifier,
          status: result.status
        }
      })
  }
}

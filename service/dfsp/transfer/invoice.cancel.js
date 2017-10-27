var joi = require('joi')
module.exports = {
  _rest: { // remove underscore to enable rest route
    rpc: 'transfer.invoice.cancel',
    path: '/cancelInvoice',
    config: {
      description: 'Cancel invoice',
      notes: 'Cancel invoice',
      tags: ['api'],
      validate: {
        payload: joi.object({
          invoiceId: joi.number().description('Invoice ID').example(1)
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Invoice Cancelled',
              schema: joi.object().keys({
                type: joi.string().description('Type'),
                invoiceId: joi.number().description('Invoice Id'),
                account: joi.string().description('Account'),
                name: joi.string().description('Name'),
                currencyCode: joi.string().description('Currency Code'),
                currencySymbol: joi.string().description('Currency Symbol'),
                amount: joi.string().description('Amount'),
                status: joi.string().description('Status'),
                identifier: joi.string().description('Identifier'),
                merchantIdentifier: joi.string().description('merchantIdentifier'),
                invoiceType: joi.string().description('Invoice Type'),
                invoiceInfo: joi.string().description('Invoice Info')
              })
            }
          }
        }
      }
    },
    method: 'post'
  },
  'invoice.cancel': function (msg, $meta) {
    // {
    //   invoiceId: 1
    // }
    return this.config.exec.call(this, msg, $meta)
      .then((invoice) => {
        return this.bus.importMethod('transfer.invoicePayer.fetch')({
          invoiceId: msg.invoiceId,
          paid: false
        })
        .then((payers) => {
          return Promise.all(payers.map((payer) => {
            return this.bus.importMethod('spsp.transfer.invoiceNotification.cancel')({
              invoiceId: '' + msg.invoiceId,
              submissionUrl: payer.directory_details.find((el) => el.primary).providerUrl + '/invoices',
              senderIdentifier: msg.identifier
            })
          }))
        })
        .then(() => invoice)
      })
  }
}

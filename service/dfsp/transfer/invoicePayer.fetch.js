var joi = require('joi')
module.exports = {
  _rest: { // remove underscore to enable rest route
    rpc: 'transfer.invoicePayer.fetch',
    path: '/fetchInvoicePayer',
    config: {
      description: 'Fetch Invoice Payer',
      notes: 'Fetch Invoice Payer',
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
              schema: joi.array().items(joi.object().keys({
                invoicePayerId: joi.number().example(1),
                invoiceId: joi.number().example(1),
                identifier: joi.string().example('321321321'),
                createdAt: joi.string().example('1999/11/11'),
                type: joi.string().example('payee'),
                name: joi.string().example('bob dylan'),
                firstName: joi.string().example('bob'),
                lastName: joi.string().example('dylan'),
                nationalId: joi.string().example('123312123'),
                dob: joi.string().example('1999/11/11'),
                account: joi.string().example('account'),
                currencyCode: joi.string().example('TZS'),
                currencySymbol: joi.string().example('$'),
                imageUrl: joi.string().example('https://red.ilpdemo.org/api/receivers/bob_dylan/profile_pic.jpg'),
                spspServer: joi.string().example('http://localhost:3043/v1')
              }))
            }
          }
        }
      }
    },
    method: 'post'
  },
  'invoicePayer.fetch': function (msg, $meta) {
    return this.config.exec.call(this, msg, $meta)
      .then((result) => {
        return Promise.all(result.map((payer) => {
          return this.bus.importMethod('ist.directory.user.get')({
            identifier: payer.identifier
          })
          .then((payee) => {
            return Object.assign({}, payer, payee)
          })
        }))
      })
  }
}

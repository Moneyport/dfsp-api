var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'invoiceApi.invoiceInfo.get',
    path: '/v1/invoice/{invoiceUrl}',
    config: {
      description: 'Get the payment details by given invoice Url',
      notes: 'Get the payment details by given invoice Url',
      tags: ['api', 'invoiceInfo', 'v1', 'invoiceApi'],
      validate: {
        params: joi.object({
          invoiceUrl: joi.string().description('Invoice URL').required()
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Invoice information',
              schema: joi.object().keys({
                type: joi.string().description('Type'),
                invoiceId: joi.number().description('Invoice Id'),
                account: joi.string().description('Account'),
                name: joi.string().description('Name'),
                currencyCode: joi.string().description('Currency Code'),
                currencySymbol: joi.string().description('Currency Symbol'),
                amount: joi.string().description('Amount'),
                status: joi.string().description('Status'),
                invoiceType: joi.string().description('Invoice Type'),
                merchantIdentifier: joi.string().description('Identifier'),
                invoiceInfo: joi.string().description('Invoice Info')
              })
            }
          }
        }
      }
    },
    method: 'get'
  },
  'invoiceInfo.get': function (msg, $meta) {
    return this.bus.importMethod('spsp.transfer.invoice.get')({
      receiver: msg.invoiceUrl
    })
  }
}

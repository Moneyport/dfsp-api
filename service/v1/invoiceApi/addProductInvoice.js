var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'invoiceApi.product.add',
    path: '/v1/invoice/product/add',
    config: {
      description: 'Add a product invoice',
      notes: 'Add a product invoice',
      tags: ['api', 'productInvoice', 'v1', 'productInvoiceAdd', 'invoiceApi'],
      validate: {
        payload: joi.object({
          account: joi.string().description('Merchant account number').example('merchant').required(),
          amount: joi.number().description('Amount').example(25.00).required(),
          merchantIdentifier: joi.string().description('Merchant identifier').example('78956562').required(),
          info: joi.string().description('Product invoice description').example('Invoice in the amount of $25 for prepaid TV')
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Product invoice added',
              schema: joi.object().keys({
                invoiceId: joi.number().description('Invoice Id'),
                account: joi.string().description('Merchant account'),
                firstName: joi.string().description('Merchant first name'),
                lastName: joi.string().description('Merchant last name'),
                currencyCode: joi.string().description('Currency code'),
                currencySymbol: joi.string().description('Currency symbol'),
                amount: joi.string().description('Amount'),
                status: joi.string().description('Status'),
                merchantIdentifier: joi.string().description('Merchant identifier'),
                invoiceType: joi.string().description('Invoice Type'),
                info: joi.string().description('Info')
              })
            }
          }
        }
      }
    },
    method: 'post'
  },
  'product.add': function (msg, $meta) {
    msg.invoiceType = 'product'
    $meta.method = 'ledger.account.get'
    return this.bus.importMethod($meta.method)({
      accountNumber: msg.account
    }, $meta)
    .then((ledgerResponse) => {
      $meta.method = 'directory.user.get'
      return this.bus.importMethod($meta.method)({
        identifier: msg.merchantIdentifier
      }, $meta)
      .then((directoryResponse) => {
        var info = (typeof msg.info !== 'undefined') ? msg.info : 'Invoice from ' + directoryResponse.firstName + ' ' + directoryResponse.lastName + ' for ' + msg.amount + ' ' + ledgerResponse.currencyCode
        $meta.method = 'dfsp/transfer.invoice.add'
        return this.bus.importMethod($meta.method)({
          account: ledgerResponse.id,
          name: directoryResponse.firstName + ' ' + directoryResponse.lastName,
          currencyCode: ledgerResponse.currencyCode,
          currencySymbol: ledgerResponse.currencySymbol,
          amount: msg.amount,
          merchantIdentifier: msg.merchantIdentifier,
          invoiceType: msg.invoiceType,
          invoiceInfo: info
        }, $meta)
        .then((invoiceResponse) => {
          return {
            invoiceId: invoiceResponse.invoiceId,
            account: msg.account,
            firstName: directoryResponse.firstName,
            lastName: directoryResponse.lastName,
            currencyCode: ledgerResponse.currencyCode,
            currencySymbol: ledgerResponse.currencySymbol,
            amount: msg.amount,
            status: invoiceResponse.status,
            merchantIdentifier: msg.merchantIdentifier,
            invoiceType: invoiceResponse.invoiceType,
            info: info
          }
        })
      })
    })
  }
}

var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'pendingTransactionsApi.invoiceNotification.get',
    path: '/v1/invoiceNotifications/{invoiceNotificationId}',
    config: {
      description: 'Get the invoice details by given invoice URL',
      notes: 'Get the invoice details by given invoice URL',
      tags: ['api', 'pendingTransactions', 'v1', 'invoiceNotifications', 'getInvoiceInfo'],
      validate: {
        params: joi.object({
          invoiceNotificationId: joi.string().description('Invoice notification id').required()
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Invoice details',
              schema: joi.object().keys({
                firstName: joi.string().description('Merchant\'s first name'),
                lastName: joi.string().description('Merchant\'s last name'),
                amount: joi.number().description('Invoice amount'),
                currencyCode: joi.string().description('Invoice currency code'),
                currencySymbol: joi.string().description('Invoice symbol'),
                merchantIdentifier: joi.string().description('Merchant identifier'),
                fee: joi.number().description('Local fee amount')
              })
            }
          }
        }
      }
    },
    method: 'get'
  },
  'invoiceNotification.get': function (msg, $meta) {
    var invoiceDetails = {}
    return this.bus.importMethod('transfer.invoiceNotification.get')({
      invoiceNotificationId: msg.invoiceNotificationId
    })
    .then((res) => {
      return this.bus.importMethod('spsp.transfer.invoice.get')({
        receiver: res.invoiceUrl
      })
    })
    .then((invoice) => {
      var invoiceAmount = Number(invoice.amount)
      invoiceDetails.currencyCode = invoice.currencyCode
      invoiceDetails.currencySymbol = invoice.currencySymbol
      invoiceDetails.firstName = invoice.firstName
      invoiceDetails.lastName = invoice.lastName
      invoiceDetails.amount = invoiceAmount
      invoiceDetails.invoiceId = invoice.invoiceId
      invoiceDetails.merchantIdentifier = invoice.merchantIdentifier
      return this.bus.importMethod('dfsp/rule.decision.fetch')({
        currency: invoice.currencyCode,
        amount: invoiceAmount
      })
      .then(decisionResult => {
        invoiceDetails.fee = decisionResult.fee || 0
        return invoiceDetails
      })
    })
  }
}

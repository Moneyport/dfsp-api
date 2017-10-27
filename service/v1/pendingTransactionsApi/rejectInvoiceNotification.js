var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'pendingTransactionsApi.invoice.reject',
    path: '/v1/invoiceNotifications/reject',
    config: {
      description: 'Reject invoiceNotification by given invoiceNotificationId',
      notes: 'Get the invoiceNotification by given invoiceNotificationId',
      tags: ['api', 'pendingTransactions', 'v1', 'invoiceNotifications', 'rejectInvoiceNotification'],
      validate: {
        payload: joi.object({
          invoiceNotificationId: joi.string().required()
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Action performed',
              schema: joi.object().keys({
                invoiceNotificationId: joi.string().description('Invoice notification Id').example('6'),
                status: joi.string().description('The new invoice notification status').example('rejected')
              })
            }
          }
        }
      }
    },
    method: 'put'
  },
  'invoice.reject': function (msg, $meta) {
    return this.bus.importMethod('transfer.invoiceNotification.reject')({
      invoiceNotificationId: msg.invoiceNotificationId
    })
    .then((response) => {
      return {
        invoiceNotificationId: msg.invoiceNotificationId,
        status: 'rejeted'
      }
    })
  }
}

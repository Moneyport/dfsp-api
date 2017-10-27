var joi = require('joi')
const PENDING_IVOICE_STATUS = 'pending'
module.exports = {
  rest: {
    rpc: 'pendingTransactionsApi.invoiceNotification.fetch',
    path: '/v1/invoiceNotifications/pending/{identifier}',
    config: {
      description: 'Get the list with invoice notifications for a given user',
      notes: 'Get all the pending invoice notifications for a given user',
      tags: ['api', 'pendingTransactions', 'v1', 'invoiceNotifications', 'getInvoiceNotificationList'],
      validate: {
        params: joi.object({
          identifier: joi.string().description('Identifier').required()
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'List invoices',
              schema: joi.object().keys({
                invoices: joi.array().items(
                  {
                    invoiceNotificationId: joi.number().description('Invoice identification number'),
                    status: joi.string().description('Invoice status'),
                    info: joi.string().description('Memo/notes')
                  }
                )
              })
            }
          }
        }
      }
    },
    method: 'get'
  },
  'invoiceNotification.fetch': function (msg, $meta) {
    return this.bus.importMethod('transfer.invoiceNotification.fetch')({
      identifier: msg.identifier,
      status: PENDING_IVOICE_STATUS
    })
    .then((resultList) => {
      if (Array.isArray(resultList) && resultList.length) {
        return {invoices: resultList.map((invoice) => {
          return {
            invoiceNotificationId: invoice.invoiceNotificationId,
            status: invoice.status,
            info: invoice.memo
          }
        })}
      }
      return {invoices: []}
    })
  }
}

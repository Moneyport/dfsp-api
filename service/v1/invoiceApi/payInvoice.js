var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'invoiceApi.invoice.pay',
    path: '/v1/invoice/pay',
    config: {
      description: 'Pay product invoice',
      notes: 'Add a pending payment',
      tags: ['api', 'v1', 'invoicePay', 'invoiceApi'],
      validate: {
        payload: joi.object({
          invoiceUrl: joi.string().description('Invoice URL').example('http://localhost:8010/invoices/1').required(),
          identifier: joi.string().description('Payer identifier').example('17500419').required(),
          account: joi.string().description('Payer account').example('bob').required()
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Invoice payment executed',
              schema: joi.object().keys({
                invoiceId: joi.string().description('Invoice Id').example('6'),
                status: joi.string().description('The new invoice status').example('paid')
              }).unknown()
            }
          }
        }
      }
    },
    method: 'post'
  },
  'invoice.pay': function (msg, $meta) {
    return this.bus.importMethod('spsp.transfer.invoice.get')({
      receiver: msg.invoiceUrl
    })
    .then((invoice) => {
      // type, invoiceId, account, name, currencyCode, currencySymbol, amount, status, invoiceType, merchantIdentifier, invoiceInfo
      return this.bus.importMethod('ledger.account.get')({
        accountNumber: msg.account
      })
      .then((ledgerAccount) => {
        return this.bus.importMethod('ist.directory.user.get')({
          identifier: invoice.merchantIdentifier
        })
        .then((payee) => {
          return this.bus.importMethod('rule.decision.fetch')({
            currency: invoice.currencyCode,
            amount: invoice.amount,
            destinationIdentifier: invoice.merchantIdentifier,
            destinationAccount: invoice.account,
            spspServer: payee.directory_details.find((el) => el.primary).providerUrl,
            sourceAccount: ledgerAccount.id,
            sourceIdentifier: msg.identifier,
            transferType: 'invoice_' + invoice.invoiceId
          })
          .then(rule => {
            return this.bus.importMethod('directory.user.get')({
              identifier: msg.identifier
            })
            .then((payer) => {
              let fee = rule.fee || 0
              return this.bus.importMethod('transfer.push.execute')({
                paymentId: rule.paymentId,
                sourceIdentifier: msg.identifier,
                sourceAccount: ledgerAccount.id,
                receiver: msg.invoiceUrl,
                destinationAmount: invoice.amount,
                currency: invoice.currencyCode,
                fee: fee,
                transferType: 'invoice',
                ipr: rule.ipr,
                sourceExpiryDuration: rule.sourceExpiryDuration,
                connectorAccount: rule.connectorAccount,
                memo: {
                  fee: fee,
                  transferCode: 'invoice',
                  debitName: payer.firstName + ' ' + payer.lastName,
                  creditName: invoice.name
                }
              })
            })
          })
        })
      })
    })
  }
}

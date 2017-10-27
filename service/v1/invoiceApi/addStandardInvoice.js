var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'invoiceApi.standard.add',
    path: '/v1/invoice/standard/add',
    config: {
      description: 'Add a standard invoice',
      notes: 'Add a standard invoice',
      tags: ['api', 'standardInvoice', 'v1', 'standardInvoiceAdd', 'invoiceApi'],
      validate: {
        payload: joi.object({
          account: joi.string().description('Merchant account number').example('merchant').required(),
          amount: joi.number().description('Amount').example(123).required(),
          identifier: joi.string().description('Client identifier').example('78956562').required(),
          merchantIdentifier: joi.string().description('merchantIdentifier').example('99826154'),
          info: joi.string().description('Invoice description').example('Invoice from merchant to Bob')
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Invoice Added',
              schema: joi.object().keys({
                invoiceId: joi.number().description('Invoice Id'),
                account: joi.string().description('Merchant account'),
                firstName: joi.string().description('Merchant\'s first name'),
                lastName: joi.string().description('Merchant\'s last name'),
                currencyCode: joi.string().description('currency code'),
                currencySymbol: joi.string().description('currency symbol'),
                amount: joi.string().description('amount'),
                status: joi.string().description('status'),
                merchantIdentifier: joi.string().description('merchant\'s identifier'),
                identifier: joi.string().description('identifier'),
                info: joi.string().description('info')
              })
            }
          }
        }
      }
    },
    method: 'post'
  },
  'standard.add': function (msg, $meta) {
    msg.invoiceType = 'standard'
    $meta.method = 'ledger.account.get'
    return this.bus.importMethod($meta.method)({
      accountNumber: msg.account
    }, $meta)
      .then((ledgerResponse) => {
        $meta.method = 'ist.directory.user.get'
        return this.bus.importMethod($meta.method)({
          identifier: msg.identifier
        }, $meta)
          .then((centralDirectoryResponse) => {
            $meta.method = 'directory.user.get'
            return this.bus.importMethod($meta.method)({
              identifier: msg.merchantIdentifier
            }, $meta)
              .then((directoryResponse) => {
                var info = (typeof msg.info !== 'undefined') ? msg.info : 'Invoice from ' + directoryResponse.firstName + ' ' + directoryResponse.lastName + ' for ' + msg.amount + ' ' + ledgerResponse.currencyCode
                $meta.method = 'transfer.invoice.add'
                return this.bus.importMethod($meta.method)({
                  account: ledgerResponse.id,
                  name: directoryResponse.firstName + ' ' + directoryResponse.lastName,
                  currencyCode: ledgerResponse.currencyCode,
                  currencySymbol: ledgerResponse.currencySymbol,
                  amount: msg.amount,
                  identifier: msg.identifier,
                  merchantIdentifier: msg.merchantIdentifier,
                  invoiceType: msg.invoiceType,
                  spspServer: centralDirectoryResponse.directory_details.find((el) => el.primary).providerUrl,
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
                      identifier: msg.identifier,
                      merchantIdentifier: msg.merchantIdentifier,
                      invoiceType: invoiceResponse.invoiceType,
                      info: info
                    }
                  })
              })
          })
      })
  }
}

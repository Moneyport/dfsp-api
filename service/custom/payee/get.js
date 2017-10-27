var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'payee.get',
    path: '/receivers/{payee}',
    config: {
      description: 'Get Payee information',
      notes: 'Obtains information about a payee',
      tags: ['api', 'spsp-server-backend'],
      validate: {
        params: joi.object({
          payee: joi.string().description('Payee')
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Payee information was obtained successfully',
              schema: joi.object({
                type: joi.string().description('Receiver type'),
                name: joi.string().description('Receiver name'),
                account: joi.string().description('Account'),
                currencyCode: joi.string().description('Currency Code'),
                currencySymbol: joi.string().description('Currency Symbol'),
                imageUrl: joi.string().description('Image URL')
              })
            }
          }
        }
      }
    },
    method: 'get'
  },
  'get': function (msg, $meta) {
    return this.bus.importMethod('directory.user.get')({
      identifier: msg.payee
    }).then((directoryRes) => {
      return this.bus.importMethod('account.actorAccount.fetch')({
        actorId: '' + directoryRes.actorId,
        isDefault: true
      }).then((accountRes) => {
        if (!accountRes[0]) {
          accountRes[0] = {accountNumber: 'noaccount'}
        }
        return this.bus.importMethod('ledger.account.get')({
          accountNumber: accountRes[0].accountNumber
        }).then((ledgerRes) => {
          return {
            type: 'payee',
            name: directoryRes.firstName + ' ' + directoryRes.lastName,
            firstName: directoryRes.firstName,
            lastName: directoryRes.lastName,
            nationalId: directoryRes.nationalId,
            dob: directoryRes.dob,
            account: ledgerRes.id,
            currencyCode: ledgerRes.currencyCode,
            currencySymbol: ledgerRes.currencySymbol,
            imageUrl: 'https://red.ilpdemo.org/api/receivers/' + directoryRes.firstName + '_' + directoryRes.lastName + '/profile_pic.jpg'
          }
        })
      })
    })
  }
}

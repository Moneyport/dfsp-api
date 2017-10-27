/* eslint no-console: 0 */
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')

var commonFunc = require('./../lib/commonFunctions.js')
const USER = commonFunc.getCustomer('user_1113')
const UNREGISTERED = commonFunc.getCustomer('unregistered')

test({
  type: 'integration',
  name: 'Ledger',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Wrong params',
        method: 'ledger.account.get',
        params: () => {
          return {
            paymentId: 'fail'
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Wrong params', 'Check error message for invalid parameters')
        }
      },
      {
        name: 'Add user',
        method: 'wallet.add',
        params: (context) => {
          return USER
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + USER.accountName,
            accountName: joi.string().valid(USER.accountName),
            accountNumber: joi.string().valid(USER.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(USER.dob),
            firstName: joi.string().valid(USER.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(USER.lastName),
            nationalId: joi.string().valid(USER.nationalId),
            password: joi.string().valid(USER.password),
            phoneNumber: joi.string().valid(USER.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(USER.roleName)
          })).error, null)
        }
      },
      {
        name: 'Account not found',
        method: 'ledger.account.get',
        params: () => {
          return {
            actorId: '0'
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Account Not Found', 'Check error message for not found account')
        }
      },
      {
        name: 'Search by actorId',
        method: 'ledger.account.get',
        params: (context) => {
          return {
            actorId: context['Add user'].actorId
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            accountType: joi.string().required(),
            accountNumber: joi.string(),
            balance: joi.string(),
            currencyCode: joi.string(),
            currencySymbol: joi.string(),
            is_disabled: joi.boolean(),
            id: joi.string(),
            ledger: joi.string(),
            name: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Search by phoneNumber',
        method: 'ledger.account.get',
        params: (context) => {
          return {
            phoneNumber: USER.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            accountType: joi.string().required(),
            accountNumber: joi.string(),
            balance: joi.string(),
            currencyCode: joi.string(),
            currencySymbol: joi.string(),
            is_disabled: joi.boolean(),
            id: joi.string(),
            ledger: joi.string(),
            name: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Search by unregistered phoneNumber',
        method: 'ledger.account.get',
        params: (context) => {
          return {
            phoneNumber: UNREGISTERED.phoneNumber
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Unknown phone', 'Check error message for unregistered phone number')
        }
      },
      {
        name: 'Ledger account fetch',
        method: 'ledger.account.fetch',
        params: (context) => {
          return {
            actorId: context['Add user'].actorId
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.array()).error, null)
        }
      },
      {
        name: 'Ledger account fetch - missing actorId',
        method: 'ledger.account.fetch',
        params: (context) => {
          return {}
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Wrong params', 'Check error message')
        }
      }
    ])
  }
}, module.parent)

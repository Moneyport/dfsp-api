/* eslint no-console: 0 */
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')

var commonFunc = require('./../lib/commonFunctions.js')
const MERCHANT = commonFunc.getMerchant('merchant_1113')
const CLIENT = commonFunc.getCustomer('client')
const ACTOR = commonFunc.getCustomer('actor')
const ACCOUNTSHARE = commonFunc.getCustomer('accountShare')
var userWithoutAccount = commonFunc.getCustomer('withoutAccount')

test({
  type: 'integration',
  name: 'Service dfsp',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Add invoice with missing invoiceType',
        method: 'transfer.invoice.add',
        params: () => {
          return {
            account: CLIENT.accountName,
            amount: '5002',
            merchantIdentifier: MERCHANT.phoneNumber,
            info: 'Test invoice API - pending invoice',
            name: MERCHANT.firstName,
            currencyCode: 'TZS',
            currencySymbol: 'TSh',
            identifier: CLIENT.phoneNumber,
            spspServer: 'http://localhost:8010'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().required(),
            amount: joi.string().required(),
            currencyCode: joi.string().required(),
            currencySymbol: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceInfo: joi.string().allow(null),
            invoiceType: joi.string(),
            merchantIdentifier: joi.string().required(),
            name: joi.string().required(),
            status: joi.string().required(),
            type: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Add new client without wallet',
        method: 'wallet.add',
        params: (context) => {
          delete userWithoutAccount.accountName
          return userWithoutAccount
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            actorId: joi.string().required(),
            dob: joi.string().valid(userWithoutAccount.dob),
            firstName: joi.string().valid(userWithoutAccount.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(userWithoutAccount.lastName),
            nationalId: joi.string().valid(userWithoutAccount.nationalId),
            password: joi.string().valid(userWithoutAccount.password),
            phoneNumber: joi.string().valid(userWithoutAccount.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(userWithoutAccount.roleName)
          })).error, null)
        }
      },
      {
        name: 'Add new actor',
        method: 'wallet.add',
        params: (context) => {
          return ACTOR
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + ACTOR.accountName,
            accountName: joi.string().valid(ACTOR.accountName),
            accountNumber: joi.string().valid(ACTOR.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(ACTOR.dob),
            firstName: joi.string().valid(ACTOR.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(ACTOR.lastName),
            nationalId: joi.string().valid(ACTOR.nationalId),
            password: joi.string().valid(ACTOR.password),
            phoneNumber: joi.string().valid(ACTOR.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(ACTOR.roleName)
          })).error, null)
        }
      },
      {
        name: 'Add new actor to share account with',
        method: 'wallet.add',
        params: (context) => {
          return ACCOUNTSHARE
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + ACCOUNTSHARE.accountName,
            accountName: joi.string().valid(ACCOUNTSHARE.accountName),
            accountNumber: joi.string().valid(ACCOUNTSHARE.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(ACCOUNTSHARE.dob),
            firstName: joi.string().valid(ACCOUNTSHARE.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(ACCOUNTSHARE.lastName),
            nationalId: joi.string().valid(ACCOUNTSHARE.nationalId),
            password: joi.string().valid(ACCOUNTSHARE.password),
            phoneNumber: joi.string().valid(ACCOUNTSHARE.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(ACCOUNTSHARE.roleName)
          })).error, null)
        }
      },
      {
        name: 'Payee get without account',
        method: 'payee.get',
        params: (context) => {
          return {
            payee: userWithoutAccount.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().required().valid('http://localhost:8014/ledger/accounts/noaccount'),
            currencyCode: joi.string(),
            currencySymbol: joi.string(),
            dob: joi.string().required(),
            firstName: joi.string(),
            lastName: joi.string(),
            imageUrl: joi.string(),
            name: joi.string(),
            nationalId: joi.string(),
            type: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Get for processing',
        method: 'bulk.payment.getForProcessing',
        params: (context) => {
          return {}
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.array().required()).error, null)
        }
      },
      {
        name: 'Get for processing',
        method: 'transfer.push.execute',
        params: (context) => {
          return {}
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'You must provide either actorId or identifier', 'Check error message')
        }
      },
      {
        name: 'Get for processing',
        method: 'bulk.payment.execute',
        params: (context) => {
          return {}
        },
        error: (error, assert) => {
          assert.true(typeof error.errorPrint === 'string', 'Check error message')
        }
      },
      {
        name: 'Actor account add',
        method: 'account.actorAccount.add',
        params: (context) => {
          return {
            actorId: context['Add new actor'].actorId,
            accountNumber: ACCOUNTSHARE.accountName,
            identifier: ACCOUNTSHARE.phoneNumber,
            isDefault: true,
            isSignatory: true,
            roleName: 'customer'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            accountId: joi.string(),
            accountNumber: joi.string(),
            actorAccountId: joi.string(),
            actorId: joi.string().required(),
            isDefault: joi.boolean(),
            isSignatory: joi.boolean(),
            permissions: joi.array()
          })).error, null)
        }
      }
    ])
  }
}, module.parent)

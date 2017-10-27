/* eslint no-console: 0 */
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')

var commonFunc = require('./../lib/commonFunctions.js')
const MERCHANT = commonFunc.getMerchant('merchant_1113')
const CLIENT = commonFunc.getCustomer('client')

test({
  type: 'integration',
  name: 'Invoice api',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Add merchant',
        method: 'wallet.add',
        params: (context) => {
          return MERCHANT
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + MERCHANT.accountName,
            accountName: joi.string().valid(MERCHANT.accountName),
            accountNumber: joi.string().valid(MERCHANT.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(MERCHANT.dob),
            firstName: joi.string().valid(MERCHANT.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(MERCHANT.lastName),
            nationalId: joi.string().valid(MERCHANT.nationalId),
            password: joi.string().valid(MERCHANT.password),
            phoneNumber: joi.string().valid(MERCHANT.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(MERCHANT.roleName)
          })).error, null)
        }
      },
      {
        name: 'Add client',
        method: 'wallet.add',
        params: (context) => {
          return CLIENT
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + CLIENT.accountName,
            accountName: joi.string().valid(CLIENT.accountName),
            accountNumber: joi.string().valid(CLIENT.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(CLIENT.dob),
            firstName: joi.string().valid(CLIENT.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(CLIENT.lastName),
            nationalId: joi.string().valid(CLIENT.nationalId),
            password: joi.string().valid(CLIENT.password),
            phoneNumber: joi.string().valid(CLIENT.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(CLIENT.roleName)
          })).error, null)
        }
      },
      {
        name: 'Get merchant information',
        method: 'invoiceApi.merchant.get',
        params: () => {
          return {
            identifier: MERCHANT.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + MERCHANT.accountName,
            spspServer: joi.string().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            currencyCode: joi.string().required(),
            currencySymbol: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Add pending invoice',
        method: 'invoiceApi.pending.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            merchantIdentifier: MERCHANT.phoneNumber,
            info: 'Test invoice API - pending invoice'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().required(),
            amount: joi.string().required(),
            currencyCode: joi.string().required(),
            currencySymbol: joi.string().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Add pending invoice - without info',
        method: 'invoiceApi.pending.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            merchantIdentifier: MERCHANT.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().required(),
            amount: joi.string().required(),
            currencyCode: joi.string().required(),
            currencySymbol: joi.string().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Add product invoice',
        method: 'invoiceApi.product.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            merchantIdentifier: MERCHANT.phoneNumber,
            info: 'Test invoice API - pending invoice'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().required(),
            amount: joi.string().required(),
            currencyCode: joi.string().required(),
            currencySymbol: joi.string().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Add product invoice without info',
        method: 'invoiceApi.product.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            merchantIdentifier: MERCHANT.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().required(),
            amount: joi.string().required(),
            currencyCode: joi.string().required(),
            currencySymbol: joi.string().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Add standard invoice',
        method: 'invoiceApi.standard.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            identifier: CLIENT.phoneNumber,
            merchantIdentifier: MERCHANT.phoneNumber,
            info: 'Test invoice API - standard invoice'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().required(),
            amount: joi.string().required(),
            currencyCode: joi.string().required(),
            currencySymbol: joi.string().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            identifier: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Add standard invoice without info',
        method: 'invoiceApi.standard.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            identifier: CLIENT.phoneNumber,
            merchantIdentifier: MERCHANT.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: joi.string().required(),
            amount: joi.string().required(),
            currencyCode: joi.string().required(),
            currencySymbol: joi.string().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            identifier: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Get invoice fees',
        method: 'invoiceApi.invoiceFees.get',
        params: (context) => {
          return {
            invoiceUrl: 'http://localhost:8010/invoices/' + context['Add standard invoice'].invoiceId,
            identifier: CLIENT.phoneNumber,
            account: CLIENT.accountName
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            fee: joi.string().required(),
            connectorFee: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Get invoice fees - missing identifier',
        method: 'invoiceApi.invoiceFees.get',
        params: (context) => {
          return {
            invoiceUrl: 'http://localhost:8010/invoices/' + context['Add standard invoice'].invoiceId,
            account: CLIENT.accountName
          }
        },
        error: (error, assert) => {
          assert.true(typeof error.errorPrint === 'string', 'Check that there is an error')
        }
      },
      {
        name: 'Get invoice fees - broken invoiceUrl',
        method: 'invoiceApi.invoiceFees.get',
        params: (context) => {
          return {
            identifier: 'fail',
            account: CLIENT.accountName
          }
        },
        error: (error, assert) => {
          assert.true(typeof error.errorPrint === 'string', 'Check that there is an error')
        }
      },
      {
        name: 'Get invoice info',
        method: 'invoiceApi.invoiceInfo.get',
        params: (context) => {
          return {
            invoiceUrl: 'http://localhost:8010/invoices/' + context['Add standard invoice'].invoiceId
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            type: joi.string(),
            invoiceId: joi.number(),
            account: joi.string(),
            name: joi.string(),
            currencyCode: joi.string(),
            currencySymbol: joi.string(),
            amount: joi.string(),
            status: joi.string(),
            invoiceType: joi.string(),
            merchantIdentifier: joi.string(),
            invoiceInfo: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Pay standard invoice',
        method: 'invoiceApi.invoice.pay',
        params: (context) => {
          return {
            invoiceUrl: 'http://localhost:8010/invoices/' + context['Add standard invoice'].invoiceId,
            identifier: CLIENT.phoneNumber,
            account: CLIENT.accountName
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            connectorAccount: joi.string(),
            fulfillment: joi.string(),
            paymentId: joi.string(),
            status: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Pay pending invoice',
        method: 'invoiceApi.invoice.pay',
        params: (context) => {
          return {
            invoiceUrl: 'http://localhost:8010/invoices/' + context['Add pending invoice'].invoiceId,
            identifier: CLIENT.phoneNumber,
            account: CLIENT.accountName
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            connectorAccount: joi.string(),
            fulfillment: joi.string(),
            paymentId: joi.string(),
            status: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Pay product invoice',
        method: 'invoiceApi.invoice.pay',
        params: (context) => {
          return {
            invoiceUrl: 'http://localhost:8010/invoices/' + context['Add product invoice'].invoiceId,
            identifier: CLIENT.phoneNumber,
            account: CLIENT.accountName
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            connectorAccount: joi.string(),
            fulfillment: joi.string(),
            paymentId: joi.string(),
            status: joi.string()
          })).error, null)
        }
      }
    ])
  }
}, module.parent)

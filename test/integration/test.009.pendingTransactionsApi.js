/* eslint no-console: 0 */
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var joi = require('joi')

var commonFunc = require('./../lib/commonFunctions.js')
const MERCHANT = commonFunc.getMerchant('merchant_1113')
const CLIENT = commonFunc.getCustomer('client')
const NEWCLIENT = commonFunc.getCustomer('newClient')

test({
  type: 'integration',
  name: 'Pending transactions api',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Add new client without invoices',
        method: 'wallet.add',
        params: (context) => {
          return NEWCLIENT
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + NEWCLIENT.accountName,
            accountName: joi.string().valid(NEWCLIENT.accountName),
            accountNumber: joi.string().valid(NEWCLIENT.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(NEWCLIENT.dob),
            firstName: joi.string().valid(NEWCLIENT.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(NEWCLIENT.lastName),
            nationalId: joi.string().valid(NEWCLIENT.nationalId),
            password: joi.string().valid(NEWCLIENT.password),
            phoneNumber: joi.string().valid(NEWCLIENT.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(NEWCLIENT.roleName)
          })).error, null)
        }
      },
      {
        name: 'Get client information',
        method: 'pendingTransactionsApi.client.get',
        params: () => {
          return {
            identifier: CLIENT.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            imageUrl: joi.string().required(),
            firstName: joi.string().required(),
            lastName: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Post invoice #0',
        method: 'pendingTransactionsApi.invoice.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            identifier: CLIENT.phoneNumber,
            invoiceType: 'standard',
            merchantIdentifier: MERCHANT.phoneNumber,
            info: 'Test pending incoice api - post invoice #0'
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
            identifier: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Post invoice #1',
        method: 'pendingTransactionsApi.invoice.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            identifier: CLIENT.phoneNumber,
            invoiceType: 'standard',
            merchantIdentifier: MERCHANT.phoneNumber,
            info: 'Test pending incoice api - post invoice #1'
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
            identifier: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Post invoice #2 - missing invoice type',
        method: 'pendingTransactionsApi.invoice.add',
        params: () => {
          return {
            account: MERCHANT.accountName,
            amount: '5002',
            identifier: CLIENT.phoneNumber,
            merchantIdentifier: MERCHANT.phoneNumber,
            info: 'Test pending incoice api - post invoice #1'
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
            identifier: joi.string().required(),
            info: joi.string().required(),
            invoiceId: joi.number().required(),
            invoiceType: joi.string().required(),
            merchantIdentifier: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Get invoice notification list',
        method: 'pendingTransactionsApi.invoiceNotification.fetch',
        params: (context) => {
          return {
            identifier: CLIENT.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            invoices: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Get invoice notification list for client without invoices',
        method: 'pendingTransactionsApi.invoiceNotification.fetch',
        params: (context) => {
          return {
            identifier: NEWCLIENT.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            invoices: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Get invoice info',
        method: 'pendingTransactionsApi.invoiceNotification.get',
        params: (context) => {
          return {
            invoiceNotificationId: context['Get invoice notification list'].invoices[0].invoiceNotificationId.toString()
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            amount: joi.number().required(),
            currencyCode: joi.string(),
            currencySymbol: joi.string(),
            fee: joi.object(),
            invoiceId: joi.number(),
            merchantIdentifier: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Pay invoice by invoice notification',
        method: 'pendingTransactionsApi.invoiceNotification.pay',
        params: (context) => {
          return {
            account: CLIENT.accountName,
            invoiceNotificationId: context['Get invoice notification list'].invoices[0].invoiceNotificationId.toString()
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            invoiceNotificationId: joi.number(),
            status: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Reject invoice by invoice notification',
        method: 'pendingTransactionsApi.invoice.reject',
        params: (context) => {
          return {
            invoiceNotificationId: context['Get invoice notification list'].invoices[1].invoiceNotificationId.toString()
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            invoiceNotificationId: joi.number(),
            status: joi.string()
          })).error, null)
        }
      }
    ])
  }
}, module.parent)

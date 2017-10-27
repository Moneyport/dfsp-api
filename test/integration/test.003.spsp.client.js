/* eslint no-console: 0 */
var test = require('ut-run/test')
var joi = require('joi')
var config = require('./../lib/appConfig')
var commonFunc = require('./../lib/commonFunctions.js')

const RECEIVER = commonFunc.getCustomer('receiver')
const MERCHANT = commonFunc.getMerchant('merchant')

test({
  type: 'integration',
  name: 'SPSP http client',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'SPSP rule decision fetch',
        method: 'spsp.rule.decision.fetch',
        params: () => {
          return {
            destinationIdentifier: 'hehe',
            destinationIdentifierType: 'tel',
            amount: '4001'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result.sourceAmount, joi.number().required()).error, null)
        }
      },
      {
        name: 'SPSP rule decision fetch - sourceAmount',
        method: 'spsp.rule.decision.fetch',
        params: () => {
          return {
            destinationIdentifier: 'hehe',
            destinationIdentifierType: 'tel',
            sourceAmount: '4001'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result.destinationAmount, joi.number().required()).error, null)
        }
      },
      {
        name: 'SPSP rule decision fetch - destinationAmount',
        method: 'spsp.rule.decision.fetch',
        params: () => {
          return {
            destinationIdentifier: 'hehe',
            destinationIdentifierType: 'tel',
            destinationAmount: '4001'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result.sourceAmount, joi.number().required()).error, null)
        }
      },
      {
        name: 'SPSP rule decision fetch - throw error',
        method: 'spsp.rule.decision.fetch',
        params: () => {
          return {}
        },
        error: (error, assert) => {
          assert.equals(joi.validate(error.errorPrint, joi.string()).error, null)
        }
      },
      {
        name: 'Transfer execute - throw error',
        method: 'spsp.transfer.transfer.execute',
        params: () => {
          return {
            ipr: 'AmDUBEffff3s/Ps0FN/ljdCxlpQwOJceAvLk1i5o0B9bggKBAYICfQAAAAAABmigUWh0dHA6Ly9sb2NhbGhvc3Q6ODAxNC9sZWRnZXIvYWNjb3VudHMvMjgxNTc1MzE3LjlseE9ZOC1YNnZVSjBRYmxxNmdQTmJFeV9EV2VuWVlmZ4ICH1BTSy8xLjAKTm9uY2U6IGdnSi03cHVlcWUySjZJVWFFSVI1WVEKRW5jcnlwdGlvbjogbm9uZQpQYXltZW50LUlkOiBiZmY0NWVjZS1mYzBmLTQ5OGQtODMxMC1iYjk2MzhlNzUxMWUKCkV4cGlyZXMtQXQ6IFRodSBBdWcgMTcgMjAxNyAxNTozNzowMCBHTVQrMDMwMCAoRkxFIERheWxpZ2h0IFRpbWUpCgp7InBheW1lbnRJZCI6ImJmZjQ1ZWNlLWZjMGYtNDk4ZC04MzEwLWJiOTYzOGU3NTExZSIsImlkZW50aWZpZXIiOiIyODE1NzUzMTgiLCJpZGVudGlmaWVyVHlwZSI6ImV1ciIsImRlc3RpbmF0aW9uQWNjb3VudCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAxNC9sZWRnZXIvYWNjb3VudHMvMjgxNTc1MzE3IiwiY3VycmVuY3kiOiJUWlMiLCJmZWUiOjAsImNvbW1pc3Npb24iOjAsInRyYW5zZmVyVHlwZSI6InAycCIsImFtb3VudCI6IjQyMDAiLCJwYXJhbXMiOnsicGVlciI6eyJpZGVudGlmaWVyIjoiMjgxNTc1MzEyIiwiaWRlbnRpZmllclR5cGUiOiJldXIifX0sImlzRGViaXQiOmZhbHNlLCJleHBpcmVzQXQiOiIyMDE3LTA4LTE3VDEyOjM3OjAwLjA1MVoifQA=',
            sourceAccount: 'sourceAccount',
            sourceAmount: 32323233,
            sourceExpiryDuration: 10,
            connectorAccount: 'connectorAccount'
          }
        },
        error: (error, assert) => {
          assert.equals(joi.validate(error.errorPrint, joi.string()).error, null)
        }
      },
      {
        name: 'Try to add invoice - user not found',
        method: 'transfer.invoice.add',
        params: () => {
          return {
            account: 'http://localhost:8014/ledger/accounts/' + MERCHANT.accountName,
            name: MERCHANT.firstName + ' ' + MERCHANT.lastName,
            currencyCode: 'TZS',
            currencySymbol: 'TSh',
            amount: 4002,
            merchantIdentifier: MERCHANT.phoneNumber,
            identifier: 'fail',
            invoiceType: 'standard',
            spspServer: 'http://localhost:8010'
          }
        },
        error: (error, assert) => {
          assert.equals(joi.validate(error.errorPrint, joi.string()).error, null)
        }
      },
      {
        name: 'Add Merchant',
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
        name: 'Add invoice',
        method: 'transfer.invoice.add',
        params: () => {
          return {
            account: 'http://localhost:8014/ledger/accounts/' + MERCHANT.accountName,
            name: MERCHANT.firstName + ' ' + MERCHANT.lastName,
            currencyCode: 'TZS',
            currencySymbol: 'TSh',
            amount: 4002,
            merchantIdentifier: MERCHANT.phoneNumber,
            identifier: RECEIVER.phoneNumber,
            invoiceType: 'standard',
            spspServer: 'http://localhost:8010'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + MERCHANT.accountName,
            amount: joi.string(),
            currencyCode: joi.string(),
            currencySymbol: joi.string(),
            invoiceId: joi.number(),
            invoiceInfo: joi.string().allow(null),
            invoiceType: joi.string(),
            merchantIdentifier: joi.string(),
            name: joi.string(),
            status: joi.string(),
            type: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Add invoice #2',
        method: 'transfer.invoice.add',
        params: () => {
          return {
            account: 'http://localhost:8014/ledger/accounts/' + MERCHANT.accountName,
            name: MERCHANT.firstName + ' ' + MERCHANT.lastName,
            currencyCode: 'TZS',
            currencySymbol: 'TSh',
            amount: 4002,
            merchantIdentifier: MERCHANT.phoneNumber,
            identifier: RECEIVER.phoneNumber,
            invoiceType: 'standard',
            spspServer: 'http://localhost:8010'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + MERCHANT.accountName,
            amount: joi.string(),
            currencyCode: joi.string(),
            currencySymbol: joi.string(),
            invoiceId: joi.number(),
            invoiceInfo: joi.string().allow(null),
            invoiceType: joi.string(),
            merchantIdentifier: joi.string(),
            name: joi.string(),
            status: joi.string(),
            type: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Try to cancel invoice without identifier',
        method: 'transfer.invoice.cancel',
        params: (context) => {
          return {
            invoiceId: context['Add invoice #2'].invoiceId
          }
        },
        error: (error, assert) => {
          assert.true(typeof error.errorPrint === 'string', 'Check that there is an error for missing identifier')
        }
      },
      {
        name: 'Cancel invoice',
        method: 'transfer.invoice.cancel',
        params: (context) => {
          return {
            invoiceId: context['Add invoice'].invoiceId,
            identifier: RECEIVER.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + MERCHANT.accountName,
            amount: joi.string(),
            currencyCode: joi.string(),
            currencySymbol: joi.string(),
            invoiceId: joi.number(),
            invoiceInfo: joi.string().allow(null),
            invoiceType: joi.string(),
            merchantIdentifier: joi.string(),
            name: joi.string(),
            status: joi.string(),
            type: joi.string()
          })).error, null)
        }
      },
      {
        name: 'Try to cancel not pending invoice',
        method: 'transfer.invoice.cancel',
        params: (context) => {
          return {
            invoiceId: context['Add invoice'].invoiceId,
            identifier: MERCHANT.phoneNumber
          }
        },
        error: (error, assert) => {
          assert.equals(joi.validate(error.errorPrint, joi.string().valid('Invoice is not in pending status').required()).error, null)
        }
      }
    ])
  }
}, module.parent)

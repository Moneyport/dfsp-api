/* eslint no-console: 0 */
var test = require('ut-run/test')
var commonFunc = require('./../lib/commonFunctions.js')
var joi = require('joi')
var config = require('./../lib/appConfig')
var uuid = require('uuid/v4')

const SENDER = commonFunc.getCustomer('sender')
const RECEIVER = commonFunc.getCustomer('receiver')
const CONNECTOR = commonFunc.getConnector('connector')
var ruleResult

test({
  type: 'integration',
  name: 'DFSP Rule service',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Add sender',
        method: 'wallet.add',
        params: (context) => {
          return SENDER
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + SENDER.accountName,
            accountName: joi.string().valid(SENDER.accountName),
            accountNumber: joi.string().valid(SENDER.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(SENDER.dob),
            firstName: joi.string().valid(SENDER.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(SENDER.lastName),
            nationalId: joi.string().valid(SENDER.nationalId),
            password: joi.string().valid(SENDER.password),
            phoneNumber: joi.string().valid(SENDER.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(SENDER.roleName)
          })).error, null)
        }
      },
      {
        name: 'Add receiver',
        method: 'wallet.add',
        params: (context) => {
          return RECEIVER
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + RECEIVER.accountName,
            accountName: joi.string().valid(RECEIVER.accountName),
            accountNumber: joi.string().valid(RECEIVER.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(RECEIVER.dob),
            firstName: joi.string().valid(RECEIVER.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string(),
            lastName: joi.string().valid(RECEIVER.lastName),
            nationalId: joi.string().valid(RECEIVER.nationalId),
            password: joi.string().valid(RECEIVER.password),
            phoneNumber: joi.string().valid(RECEIVER.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid(RECEIVER.roleName)
          })).error, null)
        }
      },
      {
        name: 'Add connector',
        method: 'wallet.add',
        params: (context) => {
          return CONNECTOR
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + CONNECTOR.accountName,
            accountName: joi.string().valid(CONNECTOR.accountName),
            accountNumber: joi.string().valid(CONNECTOR.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid(CONNECTOR.dob),
            firstName: joi.string().valid(CONNECTOR.firstName),
            identifier: joi.string().required(),
            lastName: joi.string().valid(CONNECTOR.lastName),
            nationalId: joi.string().valid(CONNECTOR.nationalId),
            password: joi.string().valid(CONNECTOR.password),
            phoneNumber: joi.string().valid(CONNECTOR.phoneNumber),
            accountTypeId: joi.number().valid(CONNECTOR.accountTypeId)
          }).unknown()).error, null)
        }
      },
      {
        name: 'Rule decision fetch - Receive',
        method: 'rule.decision.fetch',
        params: () => {
          return {
            paymentId: uuid(),
            sourceIdentifier: SENDER.phoneNumber,
            sourceIdentifierType: SENDER.identifierType,
            destinationAccount: 'http://localhost:8014/ledger/accounts/' + RECEIVER.accountName,
            spspServer: 'http://localhost:8010',
            destinationIdentifier: RECEIVER.phoneNumber,
            destinationIdentifierType: RECEIVER.identifierType,
            transferType: 'p2p',
            amountType: 'RECEIVE',
            amount: '1001',
            currency: 'TZS'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            amount: joi.string().valid('1001.00').required(),
            commission: joi.string().required(),
            connectorAccount: joi.string().required(),
            currencyId: joi.string().required(),
            destinationAccount: joi.string().required(),
            expiresAt: joi.string().required(),
            fee: joi.string().required(),
            identifier: joi.string().required(),
            identifierType: joi.string().required(),
            ipr: joi.string().required(),
            isDebit: joi.boolean().required(),
            params: joi.object().required(),
            paymentId: joi.string().required(),
            quoteId: joi.string().required(),
            receiver: joi.string().required(),
            sourceExpiryDuration: joi.number().required(),
            transferTypeId: joi.number().required()
          })).error, null)
        }
      },
      {
        name: 'Rule decision fetch - Error incorrect amount type',
        method: 'rule.decision.fetch',
        params: () => {
          return {
            paymentId: uuid(),
            sourceIdentifier: SENDER.phoneNumber,
            sourceIdentifierType: SENDER.identifierType,
            destinationAccount: 'http://localhost:8014/ledger/accounts/' + RECEIVER.accountName,
            spspServer: 'http://localhost:8010',
            destinationIdentifier: RECEIVER.phoneNumber,
            destinationIdentifierType: RECEIVER.identifierType,
            transferType: 'p2p',
            amountType: 'FAIL',
            amount: '1001',
            currency: 'TZS'
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Incorrect amount type: FAIL. Amount type should be either [SEND] or [RECEIVE]', 'Check error message for inccorect amount type')
        }
      },
      {
        name: 'Rule decision fetch - Error min amount',
        method: 'rule.decision.fetch',
        params: () => {
          return {
            paymentId: uuid(),
            sourceIdentifier: SENDER.phoneNumber,
            sourceIdentifierType: SENDER.identifierType,
            destinationAccount: 'http://localhost:8014/ledger/accounts/' + RECEIVER.accountName,
            spspServer: 'http://localhost:8010',
            destinationIdentifier: RECEIVER.phoneNumber,
            destinationIdentifierType: RECEIVER.identifierType,
            transferType: 'p2p',
            amountType: 'RECEIVE',
            amount: '0',
            currency: 'TZS'
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Minimum amount of transaction is 1000', 'Check error message for inccorect min amount')
        }
      },
      {
        name: 'Rule decision fetch - Error max amount',
        method: 'rule.decision.fetch',
        params: () => {
          return {
            paymentId: uuid(),
            sourceIdentifier: SENDER.phoneNumber,
            sourceIdentifierType: SENDER.identifierType,
            destinationAccount: 'http://localhost:8014/ledger/accounts/' + RECEIVER.accountName,
            spspServer: 'http://localhost:8010',
            destinationIdentifier: RECEIVER.phoneNumber,
            destinationIdentifierType: RECEIVER.identifierType,
            transferType: 'p2p',
            amountType: 'RECEIVE',
            amount: '99999999999',
            currency: 'TZS'
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Transfer amount limit of 100000 reached', 'Check error message for inccorect max amount')
        }
      },
      {
        name: 'Rule decision fetch - Send',
        method: 'rule.decision.fetch',
        params: () => {
          return {
            paymentId: uuid(),
            sourceIdentifier: SENDER.phoneNumber,
            sourceIdentifierType: SENDER.identifierType,
            destinationAccount: 'http://localhost:8014/ledger/accounts/' + RECEIVER.accountName,
            spspServer: 'http://localhost:8010',
            destinationIdentifier: RECEIVER.phoneNumber,
            destinationIdentifierType: RECEIVER.identifierType,
            transferType: 'p2p',
            amountType: 'SEND',
            amount: '1001',
            currency: 'TZS'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            amount: joi.string().valid('1001.00').required(),
            commission: joi.string().required(),
            connectorAccount: joi.string().required(),
            currencyId: joi.string().required(),
            destinationAccount: joi.string().required(),
            expiresAt: joi.string().required(),
            fee: joi.string().required(),
            identifier: joi.string().required(),
            identifierType: joi.string().required(),
            ipr: joi.string().allow(null),
            isDebit: joi.boolean().required(),
            params: joi.object().required(),
            paymentId: joi.string().required(),
            quoteId: joi.string().required(),
            receiver: joi.string().allow(null),
            sourceExpiryDuration: joi.number().allow(null),
            transferTypeId: joi.number().required()
          })).error, null)
        }
      },
      {
        name: 'Quote payment #0',
        method: 'rule.quote.get',
        params: () => {
          return {
            currency: 'TZS',
            amount: '4200',
            destinationIdentifier: RECEIVER.identifier,
            sourceAccount: SENDER.accountName,
            sourceIdentifier: SENDER.identifier
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            paymentId: joi.string().required(),
            commission: joi.string().required(),
            fee: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Execute payment',
        method: 'transfer.transfer.execute',
        params: (context) => {
          return {
            paymentId: context['Quote payment #0'].paymentId
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            fulfillment: joi.string().required(),
            status: joi.string().required()
          })).error, null)
        }
      },
      {
        name: 'Fetch rules for p2p transactions',
        method: 'rule.rule.fetch',
        params: () => {
          return {
            conditionId: 1
          }
        },
        result: (result, assert) => {
          ruleResult = result
        }
      },
      {
        name: 'Change max count daily restrictions for p2p transactions',
        method: 'rule.rule.edit',
        params: () => {
          ruleResult.limit = ruleResult.limit.map((record) => {
            if (record.currency === 'TZS') {
              record.maxCountDaily = 1
            }
            return record
          })
          return ruleResult
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            commission: joi.array().required(),
            condition: joi.array().required(),
            fee: joi.array().required(),
            limit: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Quote payment #1',
        method: 'rule.quote.get',
        params: () => {
          return {
            currency: 'TZS',
            amount: '1200',
            destinationIdentifier: RECEIVER.identifier,
            sourceAccount: SENDER.accountName,
            sourceIdentifier: SENDER.identifier
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Daily transfer count limit of 1 reached', 'Check error message for daily limit')
        }
      },
      {
        name: 'Fetch rules for p2p transactions',
        method: 'rule.rule.fetch',
        params: () => {
          return {
            conditionId: 1
          }
        },
        result: (result, assert) => {
          ruleResult = result
        }
      },
      {
        name: 'Change max amount/count daily restrictions for p2p transactions',
        method: 'rule.rule.edit',
        params: () => {
          ruleResult.limit = ruleResult.limit.map((record) => {
            if (record.currency === 'TZS') {
              record.maxCountDaily = 10
              record.maxAmountDaily = 4000
            }
            return record
          })
          return ruleResult
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            commission: joi.array().required(),
            condition: joi.array().required(),
            fee: joi.array().required(),
            limit: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Quote payment #2',
        method: 'rule.quote.get',
        params: () => {
          return {
            currency: 'TZS',
            amount: '4200',
            destinationIdentifier: RECEIVER.identifier,
            sourceAccount: SENDER.accountName,
            sourceIdentifier: SENDER.identifier
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Daily transfer amount limit of 4000 reached', 'Check error message for daily amount limit')
        }
      },
      {
        name: 'Fetch rules for p2p transactions',
        method: 'rule.rule.fetch',
        params: () => {
          return {
            conditionId: 1
          }
        },
        result: (result, assert) => {
          ruleResult = result
        }
      },
      {
        name: 'Change max amount/count daily restrictions for p2p transactions',
        method: 'rule.rule.edit',
        params: () => {
          ruleResult.limit = ruleResult.limit.map((record) => {
            if (record.currency === 'TZS') {
              record.maxCountDaily = 1
              record.maxAmountDaily = 100000
            }
            return record
          })
          return ruleResult
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            commission: joi.array().required(),
            condition: joi.array().required(),
            fee: joi.array().required(),
            limit: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Quote payment #3',
        method: 'rule.quote.get',
        params: () => {
          return {
            currency: 'TZS',
            amount: '5000',
            destinationIdentifier: RECEIVER.identifier,
            sourceAccount: SENDER.accountName,
            sourceIdentifier: SENDER.identifier
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Daily transfer count limit of 1 reached', 'Check error message for daily limit')
        }
      },
      {
        name: 'Change max amount/count daily restrictions for p2p transactions',
        method: 'rule.rule.edit',
        params: () => {
          ruleResult.limit = ruleResult.limit.map((record) => {
            if (record.currency === 'TZS') {
              record.maxCountDaily = 2
              record.maxAmountWeekly = 4000
            }
            return record
          })
          return ruleResult
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            commission: joi.array().required(),
            condition: joi.array().required(),
            fee: joi.array().required(),
            limit: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Quote payment #4',
        method: 'rule.quote.get',
        params: () => {
          return {
            currency: 'TZS',
            amount: '5000',
            destinationIdentifier: RECEIVER.identifier,
            sourceAccount: SENDER.accountName,
            sourceIdentifier: SENDER.identifier
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Weekly transfer amount limit of 4000 reached', 'Check error message for weekly amount limit')
        }
      },
      {
        name: 'Change max count weekly restrictions for p2p transactions',
        method: 'rule.rule.edit',
        params: () => {
          ruleResult.limit = ruleResult.limit.map((record) => {
            if (record.currency === 'TZS') {
              record.maxCountWeekly = 1
              record.maxAmountWeekly = 40000
            }
            return record
          })
          return ruleResult
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            commission: joi.array().required(),
            condition: joi.array().required(),
            fee: joi.array().required(),
            limit: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Quote payment #5',
        method: 'rule.quote.get',
        params: () => {
          return {
            currency: 'TZS',
            amount: '5000',
            destinationIdentifier: RECEIVER.identifier,
            sourceAccount: SENDER.accountName,
            sourceIdentifier: SENDER.identifier
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Weekly transfer count limit of 1 reached', 'Check error message for weekly count limit')
        }
      },
      {
        name: 'Change max amount monthly restrictions for p2p transactions',
        method: 'rule.rule.edit',
        params: () => {
          ruleResult.limit = ruleResult.limit.map((record) => {
            if (record.currency === 'TZS') {
              record.maxCountWeekly = 10
              record.maxAmountWeekly = 100000
              record.maxAmountMonthly = 4000
            }
            return record
          })
          return ruleResult
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            commission: joi.array().required(),
            condition: joi.array().required(),
            fee: joi.array().required(),
            limit: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Quote payment #6',
        method: 'rule.quote.get',
        params: () => {
          return {
            currency: 'TZS',
            amount: '5000',
            destinationIdentifier: RECEIVER.identifier,
            sourceAccount: SENDER.accountName,
            sourceIdentifier: SENDER.identifier
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Monthly transfer amount limit of 4000 reached', 'Check error message for monthly amount limit')
        }
      },
      {
        name: 'Change max count monthly restrictions for p2p transactions',
        method: 'rule.rule.edit',
        params: () => {
          ruleResult.limit = ruleResult.limit.map((record) => {
            if (record.currency === 'TZS') {
              record.maxAmountMonthly = 100000
              record.maxCountMonthly = 1
            }
            return record
          })
          return ruleResult
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            commission: joi.array().required(),
            condition: joi.array().required(),
            fee: joi.array().required(),
            limit: joi.array().required()
          })).error, null)
        }
      },
      {
        name: 'Quote payment #7',
        method: 'rule.quote.get',
        params: () => {
          return {
            currency: 'TZS',
            amount: '5000',
            destinationIdentifier: RECEIVER.identifier,
            sourceAccount: SENDER.accountName,
            sourceIdentifier: SENDER.identifier
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Monthly transfer count limit of 1 reached', 'Check error message for monthly count limit')
        }
      }
    ])
  }
}, module.parent)

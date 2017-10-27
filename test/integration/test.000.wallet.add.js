/* eslint no-console: 0 */
var test = require('ut-run/test')
var commonFunc = require('./../lib/commonFunctions.js')
var joi = require('joi')
var config = require('./../lib/appConfig')
const WEAK_PASS_ERROR_MESSAGE = 'Password does not pass security requirements!'
const AGENT = commonFunc.getAgent()

var merchant = {
  identifier: commonFunc.generateRandomNumber().toString(),
  firstName: 'firstname' + commonFunc.generateRandomNumber(),
  lastName: 'lastname' + commonFunc.generateRandomNumber(),
  dob: '10/12/1999',
  nationalId: '' + commonFunc.generateRandomNumber(),
  phoneNumber: '' + commonFunc.generateRandomNumber(),
  accountName: 'acc_' + commonFunc.generateRandomNumber(),
  password: '1234',
  roleName: 'merchant'
}

test({
  type: 'integration',
  name: 'DFSP API service',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Try add merchant with weak pass',
        method: 'wallet.add',
        params: (context) => {
          merchant.password = '12345'
          return merchant
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, WEAK_PASS_ERROR_MESSAGE)
        }
      },
      {
        name: 'Add merchant',
        method: 'wallet.add',
        params: (context) => {
          merchant.password = '1234'
          return merchant
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + merchant.accountName,
            accountName: joi.string().valid(merchant.accountName),
            accountNumber: joi.string().valid(merchant.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string().valid('10/12/1999'),
            firstName: joi.string().valid(merchant.firstName),
            identifier: joi.string().required(),
            lastName: joi.string().valid(merchant.lastName),
            nationalId: joi.string().valid(merchant.nationalId),
            password: joi.string().valid('1234'),
            phoneNumber: joi.string().valid(merchant.phoneNumber),
            roleName: joi.string().valid('merchant')
          })).error, null)
        }
      },
      {
        name: 'Add agent',
        method: 'wallet.add',
        params: (context) => {
          return AGENT
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            account: 'http://localhost:8014/ledger/accounts/' + AGENT.accountName,
            accountName: joi.string().valid(AGENT.accountName),
            accountNumber: joi.string().valid(AGENT.accountName),
            actorId: joi.string().required(),
            currency: joi.string().required(),
            dob: joi.string(),
            firstName: joi.string().valid(AGENT.firstName),
            identifier: joi.string().required(),
            identifierTypeCode: joi.string().required(),
            lastName: joi.string().valid(AGENT.lastName),
            nationalId: joi.string().valid(AGENT.nationalId),
            password: joi.string().valid('1234'),
            phoneNumber: joi.string().valid(AGENT.phoneNumber),
            role: joi.string(),
            roleName: joi.string().valid('agent')
          })).error, null)
        }
      }])
  }
}, module.parent)

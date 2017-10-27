/* eslint no-console: 0 */
var test = require('ut-run/test')
var joi = require('joi')
var config = require('./../lib/appConfig')
var commonFunc = require('./../lib/commonFunctions.js')
var uuid = require('uuid/v4')

const SENDER = commonFunc.getCustomer('sender')
const RECEIVER = commonFunc.getCustomer('receiver')

test({
  type: 'integration',
  name: 'Quotes',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Check commission',
        method: 'ledger.quote.add',
        params: () => {
          return {
            paymentId: uuid(),
            payer: {
              identifier: SENDER.phoneNumber,
              identifierType: SENDER.identifierType
            },
            payee: {
              identifier: RECEIVER.phoneNumber,
              identifierType: RECEIVER.identifierType,
              account: RECEIVER.accountName
            },
            transferType: 'cashOut',
            amountType: 'SEND',
            amount: {
              amount: '4002',
              currency: 'TZS'
            },
            fees: {
              amount: '0.25',
              currency: 'TZS'
            }
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            data: joi.object().required(),
            expiresAt: joi.string().required(),
            payeeCommission: joi.object().required(),
            payeeFee: joi.object().required(),
            paymentId: joi.string().required()
          })).error, null)
        }
      }
    ])
  }
}, module.parent)

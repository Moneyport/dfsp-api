/* eslint no-console: 0 */
var test = require('ut-run/test')
var config = require('./../lib/appConfig')
var commonFunc = require('./../lib/commonFunctions.js')

const USER = commonFunc.getCustomer('receiver')

test({
  type: 'integration',
  name: 'Notifications',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      {
        name: 'Pass invalid paramater - notification.add',
        method: 'notification.notification.add',
        params: () => {
          return {
            identifier: USER.phoneNumber,
            channel: 'sms',
            operation: 'cashIn',
            target: ''
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Invalid Parameters', 'Check error message for invalid parameters')
        }
      }
    ])
  }
}, module.parent)

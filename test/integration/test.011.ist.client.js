/* eslint no-console: 0 */
require('./../../tasks/postRules/rules')
var test = require('ut-run/test')
var config = require('./../lib/appConfig')

var commonFunc = require('./../lib/commonFunctions.js')
const userWithoutAccount = commonFunc.getCustomer('withoutAccount')

test({
  type: 'integration',
  name: 'IST http client',
  server: config.server,
  serverConfig: config.serverConfig,
  client: config.client,
  clientConfig: config.clientConfig,
  peerImplementations: config.peerImplementations,
  steps: function (test, bus, run) {
    return run(test, bus, [
      // {
      //   name: 'Try to register user with invalid identifier',
      //   method: 'ist.directory.user.add',
      //   params: () => {
      //     return {
      //       identifier: '0123456789123456789789456'
      //     }
      //   },
      //   result: (result, assert) => {
      //     var x = result
      //   },
      //   error: (error, assert) => {
      //     var t = error
      //   }
      // },
      {
        name: 'Directory user get without account',
        method: 'ist.directory.user.get',
        params: (context) => {
          return {
            identifier: userWithoutAccount.phoneNumber
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'User has no active mwallet accounts', 'Check the error message for user without mwallet accounts')
        }
      }
    ])
  }
}, module.parent)

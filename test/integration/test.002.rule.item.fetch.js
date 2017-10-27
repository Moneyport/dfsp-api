/* eslint no-console: 0 */
var test = require('ut-run/test')
var joi = require('joi')
var config = require('./../lib/appConfig')

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
        name: 'Rule decision fetch - Receive',
        method: 'rule.item.fetch',
        params: () => {
          return {}
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result.items, joi.array()).error, null)
        }
      }])
  }
}, module.parent)

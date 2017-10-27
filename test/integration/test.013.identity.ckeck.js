/* eslint no-console: 0 */
var test = require('ut-run/test')
var joi = require('joi')
var config = require('./../lib/appConfig')
var commonFunc = require('./../lib/commonFunctions.js')

const USER = commonFunc.getCustomer('receiver')

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
        name: 'Identity check',
        method: 'identity.check',
        params: () => {
          return {
            password: 'dfsp1-test',
            username: 'dfsp1-test'
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result['permission.get'], joi.array().required()).error, null)
        }
      },
      {
        name: 'Identity check',
        method: 'identity.check',
        params: () => {
          return {
            password: 'fail',
            username: 'fail'
          }
        },
        error: (error, assert) => {
          assert.equals(error.errorPrint, 'Invalid credentials', 'Check error message for wrong credentials')
        }
      },
      {
        name: 'Identity check',
        method: 'identity.check',
        params: () => {
          return {
            password: '1234',
            username: USER.phoneNumber
          }
        },
        result: (result, assert) => {
          assert.equals(joi.validate(result, joi.object().keys({
            emails: joi.array().required(),
            'identity.check': joi.object().required(),
            jwt: joi.object().required(),
            language: joi.object(),
            localisation: joi.object(),
            'permission.get': joi.array(),
            person: joi.object(),
            roles: joi.array(),
            screenHeader: joi.string().allow(''),
            xsrf: joi.object()
          })).error, null)
        }
      }
    ])
  }
}, module.parent)

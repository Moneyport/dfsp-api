/* eslint no-process-env: 0, ut-lint/exists: 0 */
module.exports = {
  server: require('../../server'),
  serverConfig: require('../../server/' + (process.env.UT_ENV || 'test')),
  client: require('../client'),
  clientConfig: require('../client/test'),
  peerImplementations: [
    require('@mojaloop/dfsp-directory'),
    require('@mojaloop/dfsp-rule'),
    require('@mojaloop/dfsp-transfer'),
    require('@mojaloop/dfsp-ledger'),
    require('@mojaloop/dfsp-identity'),
    require('@mojaloop/dfsp-account'),
    require('@mojaloop/dfsp-subscription'),
    require('@mojaloop/dfsp-mock')
  ]
}

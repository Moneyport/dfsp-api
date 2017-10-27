/* eslint no-process-env: 0, ut-lint/exists: 0 */
module.exports = {
  server: require('../../server'),
  serverConfig: require('../../server/' + (process.env.UT_ENV || 'test')),
  client: require('../client'),
  clientConfig: require('../client/test'),
  peerImplementations: [
    require('@leveloneproject/dfsp-directory'),
    require('@leveloneproject/dfsp-rule'),
    require('@leveloneproject/dfsp-transfer'),
    require('@leveloneproject/dfsp-ledger'),
    require('@leveloneproject/dfsp-identity'),
    require('@leveloneproject/dfsp-account'),
    require('@leveloneproject/dfsp-subscription'),
    require('@leveloneproject/dfsp-mock')
  ]
}

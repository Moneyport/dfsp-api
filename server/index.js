module.exports = {
  ports: [
    require('../httpclient/dfsp/identity'),
    require('../httpclient/dfsp/account'),
    require('../httpclient/dfsp/directory'),
    require('../httpclient/dfsp/ledger'),
    require('../httpclient/dfsp/subscription'),
    require('../httpclient/dfsp/rule'),
    require('../httpclient/dfsp/transfer'),
    require('../httpclient/spsp'),
    require('../httpclient/ist'),
    require('../httpserver'),
    require('../script/dfsp'),
    require('../script/custom'),
    require('../script/v1')
  ],
  modules: {
    // forensic
    forensic: require('../service/forensic'),
    // modules to be imported in the 'v1' script port
    pendingTransactionsApi: require('../service/v1/pendingTransactionsApi'),
    invoiceApi: require('../service/v1/invoiceApi'),
    // modules to be imported in the 'custom' script port
    wallet: require('../service/custom/wallet'),
    payee: require('../service/custom/payee'),
    samples: require('../service/custom/samples'),
    // modules to be imported in the 'dfsp' script port
    account: require('../service/dfsp/account'),
    directory: require('../service/dfsp/directory'),
    identity: require('../service/dfsp/identity'),
    ledger: require('../service/dfsp/ledger'),
    notification: require('../service/dfsp/notification'),
    rule: require('../service/dfsp/rule'),
    subscription: require('../service/dfsp/subscription'),
    transfer: require('../service/dfsp/transfer'),
    bulk: require('../service/dfsp/bulk'),
    cache: require('ut-cache')
  },
  validations: {

  }
}

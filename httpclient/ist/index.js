var errors = require('./errors')
var uuid = require('uuid/v4')
module.exports = {
  id: 'ist',
  createPort: require('ut-port-http'),
  namespace: ['ist'],
  raw: {
    json: true,
    jar: true,
    strictSSL: false
  },
  parseResponse: false,
  requestTimeout: 300000,
  logLevel: 'debug',
  method: 'post',
  'ist.directory.user.get.request.send': function (msg) {
    return {
      uri: '/resources',
      httpMethod: 'get',
      headers: {
        'L1p-Trace-Id': uuid(),
        'Authorization': 'Basic ' + new Buffer(this.config.key + ':' + this.config.secret).toString('base64')
      },
      qs: {
        identifier: (msg.identifier.length !== 8 ? 'tel:' : 'eur:') + msg.identifier
      }
    }
  },
  'ist.directory.user.get.response.receive': function (msg) {
    if (!msg.payload.directory_details || !msg.payload.directory_details.find((el) => el.registered)) {
      throw errors.userNotFound({})
    }
    if (!msg.payload.dfsp_details.account || msg.payload.dfsp_details.account.endsWith('/noaccount')) {
      throw errors.noAccount(msg)
    }
    if (msg.payload.fraud_details.score > (this.bus.config.fraudThreshold.userScore || 100)) {
      throw errors.userIsAboveFraudThreshold(msg)
    }
    msg.payload.currentDFSP = this.bus.config.ist.key
    return msg.payload
  },
  'ist.directory.user.get.error.receive': function (err) {
    throw errors.userNotFound({error: err})
  },
  'ist.directory.user.add.request.send': function (msg) {
    return {
      uri: '/resources',
      headers: {
        'L1p-Trace-Id': uuid(),
        'Authorization': 'Basic ' + new Buffer(this.config.key + ':' + this.config.secret).toString('base64')
      },
      payload: {
        identifier: (msg.identifier.length !== 8 ? 'tel:' : 'eur:') + msg.identifier,
        primary: true
      }
    }
  },
  'ist.directory.user.add.response.receive': function (msg) {
    return msg.payload
  },
  'ist.directory.user.add.error.receive': function (err) {
    throw errors.userCouldNotBeAdded({error: err})
  },
  'ist.directory.user.setPrimaryDFPS.request.send': function (msg) {
    return {
      uri: '/resources',
      httpMethod: 'post',
      headers: {
        'L1p-Trace-Id': uuid(),
        'Authorization': 'Basic ' + new Buffer(this.config.key + ':' + this.config.secret).toString('base64')
      },
      payload: {
        identifier: 'tel:' + msg.identifier,
        primary: true
      }
    }
  },
  'ist.directory.user.setPrimaryDFPS.response.receive': function (msg) {
    return msg.payload
  },
  'ist.directory.user.setPrimaryDFPS.error.receive': function (err) {
    throw errors.userDfspCouldNotBeChanged({error: err})
  }
}

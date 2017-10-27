var uuid = require('uuid/v4')
module.exports = {
  id: 'spsp',
  createPort: require('ut-port-http'),
  namespace: ['spsp'],
  headers: {
    Authorization: 'Basic ' + new Buffer('dfsp1' + ':' + 'dfsp1').toString('base64')
  },
  raw: {
    json: true,
    jar: true,
    strictSSL: false
  },
  parseResponse: false,
  requestTimeout: 300000,
  logLevel: 'debug',
  method: 'post',
  'spsp.rule.decision.fetch.request.send': function (msg, $meta) {
    var params = {
      httpMethod: 'get',
      headers: {
        'L1p-Trace-Id': uuid()
      },
      qs: {
        identifier: msg.destinationIdentifier,
        identifierType: msg.destinationIdentifierType || 'eur'
      }
    }
    if (msg.amount) {
      msg.destinationAmount = msg.amount
    }
    if (msg.sourceAmount) {
      params.uri = '/quoteSourceAmount'
      params.qs.sourceAmount = msg.sourceAmount
    } else if (msg.destinationAmount) {
      params.uri = '/quoteDestinationAmount'
      params.qs.destinationAmount = msg.destinationAmount
    }
    return params
  },
  'spsp.rule.decision.fetch.response.receive': function (msg, $meta) {
    return msg.payload || {}
  },
  'spsp.rule.decision.fetch.error.receive': function (err, $meta) {
    throw err
  },
  'spsp.transfer.transfer.execute.request.send': function (msg, $meta) {
    $meta.paymentId = msg.paymentId || uuid()
    delete msg.paymentId
    return this.bus.importMethod('forensic.log')({
      message: 'transfer initiated',
      paymentId: $meta.paymentId,
      payload: msg
    })
    .then(() => {
      return {
        uri: '/payments',
        httpMethod: 'put',
        payload: msg,
        headers: {
          'L1p-Trace-Id': $meta.paymentId,
          'content-type': 'application/json'
        }
      }
    })
  },
  'spsp.transfer.transfer.execute.response.receive': function (msg, $meta) {
    return this.bus.importMethod('forensic.log')({
      message: 'transfer successful',
      paymentId: $meta.paymentId,
      payload: msg.payload
    })
    .then(() => {
      return msg.payload || {}
    })
  },
  'spsp.transfer.transfer.execute.error.receive': function (err, $meta) {
    return this.bus.importMethod('forensic.log')({
      message: 'transfer failed',
      paymentId: $meta.paymentId,
      payload: err
    })
    .then(() => {
      throw err
    })
  },
  'spsp.transfer.invoiceNotification.add.request.send': function (msg, $meta) {
    // {
    //   invoiceId: '1',
    //   submissionUrl: 'http://localhost:8010/invoices',
    //   senderIdentifier: '132321132',
    //   memo: 'fasdfdsafa'
    // }
    var params = {
      uri: '/invoices',
      httpMethod: 'post',
      payload: msg,
      headers: {
        'L1p-Trace-Id': uuid(),
        'content-type': 'application/json'
      }
    }
    return params
  },
  'spsp.transfer.invoiceNotification.add.response.receive': function (msg, $meta) {
    return msg.payload || {}
  },
  'spsp.transfer.invoiceNotification.add.error.receive': function (err, $meta) {
    throw err
  },
  'spsp.transfer.invoiceNotification.cancel.request.send': function (msg, $meta) {
    // {
    //   invoiceId: '1',
    //   submissionUrl: 'http://localhost:8010/invoices',
    //   senderIdentifier: '132321132'
    // }
    msg.memo = JSON.stringify({status: 'cancelled'})
    var params = {
      uri: '/invoices',
      httpMethod: 'post',
      payload: msg,
      headers: {
        'L1p-Trace-Id': uuid(),
        'content-type': 'application/json'
      }
    }
    return params
  },
  'spsp.transfer.invoiceNotification.cancel.response.receive': function (msg, $meta) {
    return msg.payload || {}
  },
  'spsp.transfer.invoiceNotification.cancel.error.receive': function (err, $meta) {
    throw err
  },
  'spsp.transfer.invoice.get.request.send': function (msg, $meta) {
    return {
      uri: '/invoices',
      httpMethod: 'get',
      headers: {
        'L1p-Trace-Id': uuid()
      },
      qs: {
        invoiceUrl: msg.receiver
      }
    }
  },
  'spsp.transfer.invoice.get.response.receive': function (msg, $meta) {
    return msg.payload
  },
  'spsp.transfer.invoice.get.error.receive': function (err, $meta) {
    throw err
  },
  'spsp.transfer.quote.add.request.send': function (msg, $meta) {
    return {
      uri: '/quotes',
      httpMethod: 'post',
      payload: msg,
      headers: {
        'L1p-Trace-Id': msg.paymentId || uuid(),
        'content-type': 'application/json'
      }
    }
  },
  'spsp.transfer.quote.add.response.receive': function (msg, $meta) {
    return msg.payload || {}
  },
  'spsp.transfer.quote.add.error.receive': function (err, $meta) {
    throw err
  }
}

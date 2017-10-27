var helpers = require('./helpers')
module.exports = {
  'payment.process': function (record, $meta) {
    var payment
    var payee
    var dispatch = (method, msg, error) => {
      return this.bus.importMethod(method)(msg)
        .catch((e) => {
          return this.config.exec.call(this, {
            paymentId: payment.paymentId,
            actorId: payment.actorId,
            error: (e.type && e.type.startsWith('dfsp.')) ? e.message : error
          }, {method: 'bulk.payment.process'})
          .then(() => Promise.reject(e))
        })
    }
    return this.bus.importMethod('bulk.payment.preProcess')({
      paymentId: record.paymentId
    })
    .then((result) => {
      payment = result
      if (this.bus.config.tasks.scheduleBulkPayments.skipPayeeGet && payment.payee) {
        return payment.payee
      } else {
        return dispatch('ist.directory.user.get', {
          identifier: payment.identifier
        }, 'payee not found')
      }
    })
    .then((result) => {
      payee = result
      var error = helpers.checkPaymentDetails(payment, payee)
      if (error) {
        return this.config.exec.call(this, {
          paymentId: payment.paymentId,
          actorId: payment.actorId,
          error: error
        }, {method: 'bulk.payment.process'})
        .then(() => Promise.reject(error))
      }
      return dispatch('directory.user.get', {
        actorId: payment.actorId
      }, 'payer not found')
    })
    .then((payer) => {
      return dispatch('rule.decision.fetch', {
        currency: payee.dfsp_details.currencyCode,
        amount: '' + Number(payment.amount),
        destinationIdentifier: payment.identifier,
        destinationAccount: payee.dfsp_details.account,
        spspServer: payee.directory_details.find((el) => el.primary).providerUrl,
        sourceAccount: payment.account,
        sourceIdentifier: payer.identifiers[0].identifier,
        transferType: 'bulkPayment'
      }, 'fee could not be obtained')
      .then((rule) => {
        return dispatch('transfer.push.execute', {
          paymentId: rule.paymentId,
          sourceIdentifier: payer.identifiers[0].identifier,
          sourceAccount: payment.account,
          receiver: payee.directory_details.find((el) => el.primary).providerUrl + '/receivers/' + payment.identifier,
          destinationAmount: payment.amount,
          currency: payee.dfsp_details.currencyCode,
          fee: rule.fee || 0,
          transferType: 'bulkPayment',
          ipr: rule.ipr,
          sourceExpiryDuration: rule.sourceExpiryDuration,
          connectorAccount: rule.connectorAccount,
          memo: {
            fee: rule.fee || 0,
            transferCode: 'bulkPayment',
            creditName: payee.dfsp_details.name,
            debitName: payer.firstName + ' ' + payer.lastName
          }
        }, 'payment failed')
      })
      .then(() => {
        return this.config.exec.call(this, {
          paymentId: payment.paymentId,
          actorId: payment.actorId,
          error: ''
        }, {method: 'bulk.payment.process'})
      })
      .catch(() => ({}))
    })
  }
}

var status = {}
var helpers = require('./helpers')

module.exports = {
  'batch.check': function (msg, $meta) {
    // set status verifying
    var dispatch = (method, params) => {
      params.actorId = msg.actorId
      params.batchId = msg.batchId
      return this.config.exec.call(this, params, {method: method})
    }
    var importMethod = (method) => {
      return this.bus.importMethod(method)
    }

    function checkPayments (params) {
      return dispatch('bulk.payment.fetch', params)
        .then(function (payments) {
          if (!payments.data || !payments.data.length) {
            return true
          }
          var promise = Promise.resolve()
          payments.data.forEach((payment) => {
            promise = promise.then(function () {
              return importMethod('ist.directory.user.get')({identifier: payment.identifier})
                .then(function (result) {
                  var res = {
                    paymentStatusId: status.payment.verified,
                    payee: result
                  }
                  var info = helpers.checkPaymentDetails(payment, result)
                  if (info) {
                    res.paymentStatusId = status.payment.mismatch
                    res.info = info
                  }
                  return res
                })
                .catch((e) => {
                  return {
                    paymentStatusId: status.payment.mismatch,
                    info: (e.type && e.type.startsWith('dfsp.')) ? e.message : 'User not found'}
                })
                .then((params) => {
                  params.paymentId = payment.paymentId
                  return dispatch('bulk.payment.edit', {payments: [params]})
                })
            })
          })
          return promise.then(function () {
            params.pageNumber++
            return checkPayments(params)
          })
        })
    }
    var promise = Promise.resolve()
    if (!status.batch) {
      promise = promise
        .then(() => importMethod('bulk.batchStatus.fetch')({}))
        .then(function (batchStatus) {
          status.batch = batchStatus.reduce(function (all, record) {
            all[record.name] = record.key
            return all
          }, {})
        })
    }
    if (!status.payment) {
      promise = promise
        .then(() => importMethod('bulk.paymentStatus.fetch')({}))
        .then(function (paymentStatus) {
          status.payment = paymentStatus.reduce(function (all, record) {
            all[record.name] = record.key
            return all
          }, {})
        })
    }
    return promise
      .then(function () {
        return dispatch('bulk.batch.edit', {
          batchStatusId: status.batch.verifying // set verifying
        })
      })
      .then(function (result) {
        var params = {pageSize: 100, pageNumber: 1, actorId: msg.actorId}
        if (msg.payments) {
          params.paymentId = msg.payments
        } else {
          params.batchId = msg.batchId
        }
        function proceed () {
          return checkPayments(params)
            .then(function () {
              return dispatch('bulk.batch.revertStatus', {partial: !!msg.payments})
            })
        }
        if (msg.async) {
          process.nextTick(proceed)
          return result
        }
        return proceed()
      })
  }
}

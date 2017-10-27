module.exports = function (bus) {
  return bus.importMethod('bulk.payment.getForProcessing')({count: 10})
    .then(function (payments) {
      var promise = Promise.resolve()
      payments.forEach(function (payment) {
        promise = promise.then(function () {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(bus.importMethod('bulk.payment.execute')(payment))
            }, bus.config.tasks.scheduleBulkPayments.timeout * 1000 || 0)
          })
        })
      })
      return promise
    })
}

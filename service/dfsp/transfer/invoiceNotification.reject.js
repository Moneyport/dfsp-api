module.exports = {
  'invoiceNotification.reject': function (msg, $meta) {
    return this.config.exec.call(this, msg, $meta)
    .then((invoice) => {
      return this.bus.importMethod('spsp.transfer.invoice.get')({
        receiver: invoice.invoiceUrl
      })
      .then((res) => {
        return this.bus.importMethod('notification.notification.add')({
          channel: 'sms',
          operation: 'invoiceCancel',
          target: 'destination',
          identifier: res.merchantIdentifier,
          params: invoice
        })
      })
    })
  }
}

module.exports = {
  'actorAccount.add': function (msg, $meta) {
    return this.config.exec.call(this, msg, $meta)
    .then((res) => {
      if (msg.identifier) {
        return this.bus.importMethod('notification.notification.add')({
          channel: 'sms',
          operation: 'addHolder',
          target: 'destination',
          identifier: msg.identifier,
          params: msg
        })
        .then(() => res)
      } else {
        return res
      }
    })
  }
}

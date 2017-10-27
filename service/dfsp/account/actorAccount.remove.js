module.exports = {
  'actorAccount.remove': function (msg, $meta) {
    return this.config.exec.call(this, msg, $meta)
    .then((res) => {
      if (msg.actorId) {
        return this.bus.importMethod('notification.notification.add')({
          channel: 'sms',
          operation: 'removeHolder',
          target: 'destination',
          actorId: msg.actorId,
          params: msg
        })
        .then(() => res)
      } else {
        return res
      }
    })
  }
}

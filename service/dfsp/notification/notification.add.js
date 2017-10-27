var errors = require('./errors')
var nomenclatures = {}

module.exports = {
  'notification.add': function (msg, $meta) {
    var promise = Promise.resolve()
    if (!nomenclatures.channel) {
      promise = promise
      .then(() => this.bus.importMethod('notification.channel.fetch')({}))
      .then(function (channel) {
        nomenclatures.channel = channel.reduce(function (all, record) {
          all[record.name] = record.channelId
          return all
        }, {})
      })
    }
    if (!nomenclatures.operation) {
      promise = promise
      .then(() => this.bus.importMethod('notification.operation.fetch')({}))
      .then(function (operation) {
        nomenclatures.operation = operation.reduce(function (all, record) {
          all[record.name] = record.operationId
          return all
        }, {})
      })
    }
    if (!nomenclatures.target) {
      promise = promise
      .then(() => this.bus.importMethod('notification.target.fetch')({}))
      .then(function (target) {
        nomenclatures.target = target.reduce(function (all, record) {
          all[record.name] = record.targetId
          return all
        }, {})
      })
    }
    return promise.then(() => {
      if (msg.actorId) {
        return msg
      }
      return this.bus.importMethod('directory.user.get')({
        identifier: msg.identifier
      })
    })
    .then((res) => {
      if (!nomenclatures.channel[msg.channel] || !nomenclatures.operation[msg.operation] || !nomenclatures.target[msg.target]) {
        throw errors.invalidParameters(msg)
      }
      return this.bus.importMethod('notification.add.execute')({
        channelId: nomenclatures.channel[msg.channel],
        operationId: nomenclatures.operation[msg.operation],
        targetId: nomenclatures.target[msg.target],
        actorId: '' + res.actorId,
        params: msg.params
      })
    })
  }
}

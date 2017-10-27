var errors = require('./errors')
module.exports = {
  'account.get': function (msg, $meta) {
    /*
      e.g.
      {
        phoneNumber": "0122523365226"
      }

    */
    // var msg = {
    //   uri: '/rpc/' + $meta.method,
    //   payload: {
    //     id: '1',
    //     jsonrpc: '2.0',
    //     method: $meta.method,
    //     params: {}
    //   }
    // }

    if (msg.accountNumber) {
      return this.config.exec.call(this, {
        accountNumber: msg.accountNumber
      }, $meta)
    } else if (msg.actorId) {
      return this.bus.importMethod('account.actorAccount.fetch')({
        actorId: msg.actorId
      })
      .then((res) => {
        var account = Array.isArray(res) && res[0]
        if (!account) {
          throw errors.accountNotFound({
            phoneNumber: msg.phoneNumber
          })
        }
        return this.config.exec.call(this, {
          accountNumber: account.accountNumber
        }, $meta)
      })
    } else if (msg.phoneNumber) {
      return this.bus.importMethod('subscription.subscription.get')({
        phoneNumber: msg.phoneNumber
      })
      .then((res) => {
        if (!res.actorId) {
          throw errors.unknownPhone({
            phoneNumber: msg.phoneNumber
          })
        }
        return this.bus.importMethod('account.actorAccount.fetch')({
          actorId: res.actorId
        })
        .then((res) => {
          var account = Array.isArray(res) && res[0]
          if (!account) {
            throw errors.accountNotFound({
              phoneNumber: msg.phoneNumber
            })
          }
          return this.config.exec.call(this, {
            accountNumber: account.accountNumber
          }, $meta)
        })
      })
    } else {
      return Promise.reject(errors.wrongParams({
        params: msg,
        method: $meta.method
      }))
    }
  }
}

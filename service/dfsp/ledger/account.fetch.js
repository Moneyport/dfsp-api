var errors = require('./errors')
module.exports = {
  'account.fetch': function (msg, $meta) {
    /*
      e.g.
      {
        "actorId": "1234"
      }
      or
      {
        "accountNumber": ['bob', 'alice']
      }
    */
    if (msg.actorId) {
      return this.bus.importMethod('account.actorAccount.fetch')({
        actorId: msg.actorId
      })
      .then((accounts) => {
        if (!accounts.length) {
          return accounts
        }
        return this.config.exec.call(this, {
          accountNumber: accounts.map(account => account.accountNumber)
        }, $meta)
      })
    } else if (msg.accountNumber) {
      return this.config.exec.call(this, msg, $meta)
    } else {
      return Promise.reject(errors.wrongParams({
        params: msg,
        method: $meta.method
      }))
    }
  }
}

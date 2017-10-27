module.exports = {
  'check': function (msg, $meta) {
    var userPass = this.bus.config.cluster
    var startTime = Date.now()
    if (
      // api basic auth
      userPass &&
      typeof userPass === 'string' &&
      msg.username === userPass &&
      msg.password === userPass
    ) {
      return {
        'permission.get': ['*']
      }
    }
    return this.config.exec.call(this, msg, {method: 'identity.check'})
      .then((result) => {
        if (!result['identity.check']) {
          return result
        }
        return this.bus.importMethod('directory.user.get')({
          actorId: result['identity.check'].actorId
        })
          .then((person) => {
            result.person = person
            result.emails = []
            if (!msg.actorId) {
              let duration = Date.now() - startTime
              return this.bus.importMethod('forensic.log')({
                message: 'Successfull user login',
                username: msg.username,
                duration: duration
              })
                .then(() => {
                  return result
                })
            } else {
              return result
            }
          })
      })
      .catch((e) => {
        if (e.message === 'Invalid credentials' && typeof msg.password !== 'undefined') {
          return this.bus.importMethod('forensic.log')({
            message: 'Unsuccessfull user login',
            username: msg.username
          })
            .then(() => {
              throw (e)
            })
        } else {
          throw (e)
        }
      })
  }
}

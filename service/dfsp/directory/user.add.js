var createUser = function (thisArg, msg, $meta) {
  return thisArg.bus.importMethod('ist.directory.user.add')({
    identifier: msg.identifier
  })
  .then((res) => {
    return thisArg.config.exec.call(thisArg, msg, $meta)
      .then((result) => {
        return thisArg.bus.importMethod('forensic.log')({
          message: 'User created',
          payload: {
            identifier: msg.identifier,
            identifierTypeCode: msg.identifierTypeCode
          }
        })
        .then(() => {
          return result
        })
      })
  })
}
var prefix
module.exports = {
  'user.add': function (msg, $meta) {
    if (!msg.identifier) {
      if (!prefix) {
        prefix = this.bus.config.prefix || this.bus.config.cluster.split('-')[0].slice(-1)
      }
      msg.identifier = prefix + ('' + process.hrtime()[1]).slice(-7)
    }
    msg.identifierTypeCode = msg.identifierTypeCode || (msg.phoneNumber.length !== 8 ? 'tel' : 'eur')
    return this.bus.importMethod('ist.directory.user.get')({
      identifier: msg.phoneNumber
    })
    .then((res) => {
      return this.bus.importMethod('directory.user.get')({
        identifier: msg.identifier,
        identifierTypeCode: msg.identifierTypeCode
      })
    })
    .catch((e) => {
      var user = {
        identifier: '' + msg.identifier,
        identifierTypeCode: msg.identifierTypeCode,
        firstName: msg.firstName,
        lastName: msg.lastName,
        dob: msg.dob,
        nationalId: msg.nationalId
      }
      if (e.type.endsWith('UserNotFound')) {
        return this.bus.importMethod('ist.directory.user.add')({
          identifier: msg.phoneNumber
        })
        .then((res) => {
          return this.bus.importMethod('forensic.log')({
            message: 'User added in the central directory',
            payload: {
              identifier: user.identifier,
              identifierTypeCode: user.identifierTypeCode
            }
          })
          .then(() => {
            return createUser(this, user, $meta)
          })
        })
      } else if (e.type === 'dfsp.ist.noaccount') {
        return createUser(this, user, $meta)
      }
      throw e
    })
  }
}

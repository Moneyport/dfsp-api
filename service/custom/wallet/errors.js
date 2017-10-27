var create = require('ut-error').define
var DFSP = require('../../../dfspError')
var Identity = create('identity', DFSP)
var WeakPassword = create('weakPassword', Identity)
const WEAK_PASS_ERROR_MESSAGE = 'Password does not pass security requirements!'
module.exports = {
  weakPassword: function () {
    return new WeakPassword({message: WEAK_PASS_ERROR_MESSAGE})
  }
}

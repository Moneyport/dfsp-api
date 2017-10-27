var create = require('ut-error').define
var DFSP = require('../../../dfspError')
var Notification = create('notification', DFSP)
var InvalidParameters = create('invalidParameters', Notification)
module.exports = {
  invalidParameters: function (params) {
    return new InvalidParameters({message: 'Invalid Parameters', params: params})
  }
}

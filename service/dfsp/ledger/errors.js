var create = require('ut-error').define
var DFSP = require('../../../dfspError')
var Ledger = create('ledger', DFSP)
var WrongParams = create('WrongParams', Ledger)
var UnknownPhone = create('UnknownPhone', Ledger)
var AccountNotFound = create('AccountNotFound', Ledger)
module.exports = {
  ledger: function (cause) {
    return new Ledger(cause)
  },
  wrongParams: function (params) {
    return new WrongParams({message: 'Wrong params', params: params})
  },
  unknownPhone: function (params) {
    return new UnknownPhone({message: 'Unknown phone', params: params})
  },
  accountNotFound: function (params) {
    return new AccountNotFound({message: 'Account Not Found', params: params})
  }
}

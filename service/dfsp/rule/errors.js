var create = require('ut-error').define
var DFSP = require('../../../dfspError')
var Rule = create('rule', DFSP)
var MinAmount = create('minAmount', Rule)
var MaxAmount = create('maxAmount', Rule)
var MaxAmountDaily = create('maxAmountDaily', Rule)
var MaxCountDaily = create('maxCountDaily', Rule)
var MaxAmountWeekly = create('maxAmountWeekly', Rule)
var MaxCountWeekly = create('maxCountWeekly', Rule)
var MaxAmountMonthly = create('maxAmountMonthly', Rule)
var MaxCountMonthly = create('maxCountMonthly', Rule)
var IncorrectAmountType = create('incorrectAmountType', Rule)
module.exports = {
  rule: function (cause) {
    return new Rule(cause)
  },
  minAmount: function (params) {
    return new MinAmount({
      message: 'Minimum amount of transaction is {limit}',
      params: params
    })
  },
  maxAmount: function (params) {
    return new MaxAmount({
      message: 'Transfer amount limit of {limit} reached',
      params: params
    })
  },
  maxAmountDaily: function (params) {
    return new MaxAmountDaily({
      message: 'Daily transfer amount limit of {limit} reached',
      params: params
    })
  },
  maxCountDaily: function (params) {
    return new MaxCountDaily({
      message: 'Daily transfer count limit of {limit} reached',
      params: params
    })
  },
  maxAmountWeekly: function (params) {
    return new MaxAmountWeekly({
      message: 'Weekly transfer amount limit of {limit} reached',
      params: params
    })
  },
  maxCountWeekly: function (params) {
    return new MaxCountWeekly({
      message: 'Weekly transfer count limit of {limit} reached',
      params: params
    })
  },
  maxAmountMonthly: function (params) {
    return new MaxAmountMonthly({
      message: 'Monthly transfer amount limit of {limit} reached',
      params: params
    })
  },
  maxCountMonthly: function (params) {
    return new MaxCountMonthly({
      message: 'Monthly transfer count limit of {limit} reached',
      params: params
    })
  },
  incorrectAmountType: function (params) {
    return new IncorrectAmountType({
      message: 'Incorrect amount type: {amountType}. Amount type should be either [SEND] or [RECEIVE]',
      params: params
    })
  }
}

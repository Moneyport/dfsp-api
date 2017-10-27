// joi.object().keys({
//   paymentId: joi.string().required().regex(/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/).example('3a2a1d9e-8640-4d2d-b06c-84f2cd613300').description('The UUID for the local transfer'),
//   payer: joi.object().keys({
//     identifier: joi.string().required().example('92806391'),
//     identifierType: joi.string().required().example('eur')
//   }).required(),
//   payee: joi.object().keys({
//     identifier: joi.string().required().example('30754016'),
//     identifierType: joi.string().required().example('eur')
//   }).required(),
//   transferType: joi.string().required().example('p2p'),
//   amountType: joi.string().required().valid(['SEND', 'RECEIVE']).example('SEND'),
//   amount: joi.object().keys({
//     amount: joi.string().required().example('10'),
//     currency: joi.string().required().example('TZS')
//   }).required(),
//   fees: joi.object().keys({
//     amount: joi.string().required().example('0.25'),
//     currency: joi.string().required().example('TZS')
//   }).required()
// }).unknown().required()
var error = require('./errors')
var uuid = require('uuid/v4')

function ruleDecisionFetch (msg, $meta) {
  return this.bus.importMethod('ledger.transferType.fetch')({})
    .then((transferTypes) => {
      return this.config.exec.call(this, {
        currency: msg.amount.currency,
        amount: msg.amount.amount,
        operationId: transferTypes.find((el) => el.transferCode === msg.transferType).transferTypeId
      }, $meta)
    })
    .then((rule) => {
      return this.bus.importMethod('ledger.transfer.fetch')({
        transferType: msg.transferType,
        identifier: msg.payer.identifier,
        identifierType: msg.payer.identifierType,
        currency: msg.amount.currency,
        isDebit: true
      })
      .then((transfers) => {
        // decisions, decisions...
        if (rule.limit.minAmount && msg.amount.amount < rule.limit.minAmount) {
          throw error.minAmount({ limit: rule.limit.minAmount })
        }
        if (rule.limit.maxAmount && msg.amount.amount > rule.limit.maxAmount) {
          throw error.maxAmount({limit: rule.limit.maxAmount})
        }
        if (rule.limit.maxAmountDaily && +transfers.amountDaily + +msg.amount.amount > rule.limit.maxAmountDaily) {
          throw error.maxAmountDaily({ limit: rule.limit.maxAmountDaily })
        }
        if (rule.limit.maxCountDaily && transfers.countDaily >= rule.limit.maxCountDaily) {
          throw error.maxCountDaily({ limit: rule.limit.maxCountDaily })
        }
        if (rule.limit.maxAmountWeekly && +transfers.amountWeekly + +msg.amount.amount > rule.limit.maxAmountWeekly) {
          throw error.maxAmountWeekly({ limit: rule.limit.maxAmountWeekly })
        }
        if (rule.limit.maxCountWeekly && transfers.countWeekly >= rule.limit.maxCountWeekly) {
          throw error.maxCountWeekly({ limit: rule.limit.maxCountWeekly })
        }
        if (rule.limit.maxAmountMonthly && +transfers.amountMonthly + +msg.amount.amount > rule.limit.maxAmountMonthly) {
          throw error.maxAmountMonthly({ limit: rule.limit.maxAmountMonthly })
        }
        if (rule.limit.maxCountMonthly && transfers.countMonthly >= rule.limit.maxCountMonthly) {
          throw error.maxCountMonthly({ limit: rule.limit.maxCountMonthly })
        }
        return rule
      })
    })
}

module.exports = {
  'decision.fetch': function (params, $meta) {
    // from ussd
    // ---------------------
    // currency: params.transfer.destinationCurrency,
    // amount: params.transfer.destinationAmount,
    // destinationIdentifier: params.transfer.identifier,
    // destinationAccount: params.transfer.destinationAccount,
    // sourceAccount: params.user.sourceAccountName,
    // sourceIdentifier: params.user.identifier,
    // spspServer: params.transfer.spspServer,
    // transferType: 'p2p'
    // -------------------------------------------------
    // format message
    var transferType = params.transferType
    var msg = {
      paymentId: uuid(),
      payer: {
        identifier: params.sourceIdentifier,
        identifierType: params.sourceIdentifierType || 'eur'
      },
      payee: {
        account: params.destinationAccount,
        url: params.spspServer,
        identifier: params.destinationIdentifier,
        identifierType: params.destinationIdentifierType || 'eur'
      },
      transferType: params.transferType.split('_')[0],
      amountType: params.amountType || 'RECEIVE',
      amount: {
        amount: params.amount,
        currency: params.currency || 'TZS'
      }
    }
    // joi.object().keys({
    //     payer: joi.object().keys({
    //       identifier: joi.string().required().example('92806391'),
    //       identifierType: joi.string().required().example('eur')
    //     }).required(),
    //     payee: joi.object().keys({
    //       identifier: joi.string().required().example('30754016'),
    //       identifierType: joi.string().required().example('eur')
    //     }).required(),
    //     transferType: joi.string().required().example('p2p'),
    //     amountType: joi.string().required().valid(['SEND', 'RECEIVE']).example('SEND'),
    //     amount: joi.object().keys({
    //       amount: joi.string().required().example('10'),
    //       currency: joi.string().required().example('TZS')
    //     }).required(),
    //   }).unknown()
    // }
    if (msg.amountType === 'SEND') {
      return ruleDecisionFetch.call(this, msg, $meta)
        .then((rule) => {
          msg.fees = {
            amount: '' + rule.fee.amount,
            currency: msg.amount.currency
          }
          msg.amount.amount = '' + (Number(msg.amount.amount) - Number(rule.fee.amount))
          return this.bus.importMethod('dfsp/ledger.quote.add')({
            paymentId: msg.paymentId,
            identifier: msg.payer.identifier,
            identifierType: msg.payer.identifierType,
            destinationAccount: msg.payee.account,
            currency: msg.amount.currency,
            fee: rule.fee.amount,
            amount: msg.amount.amount,
            commission: (msg.transferType === 'cashIn') ? rule.commission.amount : 0,
            transferType: msg.transferType,
            params: {
              peer: msg.payee
            },
            isDebit: true
          })
          .then((localQuote) => {
            return this.bus.importMethod('spsp.transfer.quote.add')(Object.assign({}, msg, {transferType}))
              .then((remoteQuote) => localQuote)
          })
        })
    } else if (msg.amountType === 'RECEIVE') {
      return this.bus.importMethod('spsp.transfer.quote.add')(Object.assign({}, msg, {transferType}))
        .then((remoteQuote) => {
          // result
          //  {
          //     "paymentId": "110ec58a-a0f2-4ac4-8393-c866d813b8d1",
          //     "receiveAmount": {
          //       "amount": "9.25",
          //       "currency": "TZS"
          //     },
          //     "payeeFee": {
          //       "amount": "1",
          //       "currency": "TZS"
          //     },
          //     "payeeCommission": {
          //       "amount": "1",
          //       "currency": "TZS"
          //     },
          //     "connectorAccount": "http://host:port/scheme/adapter/v1/ilp/ledger/v1/accounts/dfsp1-testconnector",
          //     "ipr": "c29tZSBpcHIgaGVyZQ==",
          //     "sourceExpiryDuration": "10"
          // }
          return ruleDecisionFetch.call(this, msg, $meta)
          .then((rule) => {
            return this.bus.importMethod('dfsp/ledger.quote.add')({
              paymentId: msg.paymentId,
              identifier: msg.payer.identifier,
              identifierType: msg.payer.identifierType,
              destinationAccount: msg.payee.account,
              receiver: params.spspServer + '/receivers/' + params.destinationIdentifier,
              currency: msg.amount.currency,
              fee: rule.fee.amount,
              amount: Number(remoteQuote.receiveAmount.amount) + Number(remoteQuote.payeeFee.amount),
              commission: (msg.transferType === 'cashIn') ? rule.commission.amount : 0,
              transferType: msg.transferType,
              ipr: remoteQuote.ipr,
              sourceExpiryDuration: remoteQuote.sourceExpiryDuration,
              connectorAccount: remoteQuote.connectorAccount,
              params: {
                peer: msg.payee
              },
              isDebit: true
            })
          })
        })
    } else {
      throw error.incorrectAmountType({ amountType: msg.amountType })
    }
  }
}

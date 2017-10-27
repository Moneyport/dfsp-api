module.exports = [
  {
    condition: {
      priority: 100,
      operationTag: 'p2p'
    },
    fee: [
      {
        startAmount: 20,
        startAmountCurrency: 'USD',
        isSourceAmount: true,
        minValue: 0,
        maxValue: 5,
        percent: 1
      }
    ],
    commission: [
      {
        startAmount: 20,
        startAmountCurrency: 'USD',
        isSourceAmount: true,
        minValue: 0,
        maxValue: 5,
        percent: 1,
        percentBase: 50
      }
    ],
    limit: [
      {
        currency: 'USD',
        minAmount: 10,
        maxAmount: 1000,
        maxAmountDaily: 1000,
        maxCountDaily: 1000,
        maxAmountWeekly: 1000,
        maxCountWeekly: 1000,
        maxAmountMonthly: 1000,
        maxCountMonthly: 1000
      }
    ]
  }
]

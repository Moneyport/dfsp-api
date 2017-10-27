module.exports = {
  'item.fetch': function () {
    var data = [
      // currency
      {
        type: 'currency',
        value: 'USD',
        display: 'USD'
      },
      {
        type: 'currency',
        value: 'TZS',
        display: 'TZS'
      },
      // channel
      {
        type: 'channel',
        value: 1,
        display: 'USSD'
      },
      // country
      {
        type: 'country',
        value: 1,
        display: 'USA'
      },
      // region
      {
        type: 'region',
        value: 1,
        display: 'West'
      },
      // city
      {
        type: 'city',
        value: 1,
        display: 'Seattle'
      },
      {
        type: 'city',
        value: 2,
        display: 'Redmond'
      },
      {
        type: 'city',
        value: 3,
        display: 'San Francisco'
      },
      // organization
      {
        type: 'organization',
        value: 1,
        display: 'Organization Name'
      },
      // supervisor
      {
        type: 'supervisor',
        value: 1,
        display: 'CEO'
      },
      // product
      {
        type: 'product',
        value: 1,
        display: 'Product name'
      },
      // account
      {
        type: 'account',
        value: 1,
        display: 'Account name'
      }
    ]
    return this.bus.importMethod('identity.role.fetch')({})
    .then((res) => {
      return res.forEach((el) => {
        data.push({
          type: 'role',
          value: el.roleId,
          display: el.name
        })
      })
    })
    .then(() => {
      return this.bus.importMethod('ledger.transferType.fetch')({})
      .then((res) => {
        res.forEach((el) => {
          data.push({
            type: 'operation',
            value: el.transferTypeId,
            code: el.transferCode,
            display: el.name
          })
        })
        return {items: data}
      })
    })
  }
}

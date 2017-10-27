var seed = (Date.now() - 1463200000000) * 100 // 1463200000000 is 14 May 2016
function next () {
  seed += 1
  return seed % 1000000000
}

var testCustomers = []
var testMerchants = []
var testAgents = []
var testConnectors = []

module.exports = {
  /**
   * @return {number} Random number
   */
  generateRandomNumber: function () {
    return next()
  },

  getCustomer: function (identifier) {
    if (!testCustomers[identifier]) {
      testCustomers[identifier] = {
        phoneNumber: '1' + this.generateRandomNumber().toString().slice(-8),
        firstName: 'firstName' + this.generateRandomNumber(),
        lastName: 'lastName' + this.generateRandomNumber(),
        dob: '1911-11-11',
        nationalId: this.generateRandomNumber().toString(),
        accountName: this.generateRandomNumber().toString(),
        role: '1',
        roleName: 'customer',
        identifier: this.generateRandomNumber().toString(),
        identifierTypeCode: 'tel',
        password: '1234'
      }
    }

    return testCustomers[identifier]
  },

  getMerchant: function (identifier) {
    if (!testMerchants[identifier]) {
      testMerchants[identifier] = {
        phoneNumber: '1' + this.generateRandomNumber().toString().slice(-8),
        firstName: 'firstName' + this.generateRandomNumber(),
        lastName: 'lastName' + this.generateRandomNumber(),
        dob: '1911-11-11',
        nationalId: this.generateRandomNumber().toString(),
        accountName: this.generateRandomNumber().toString(),
        role: '2',
        roleName: 'merchant',
        identifier: this.generateRandomNumber().toString(),
        identifierTypeCode: 'tel',
        password: '1234'
      }
    }

    return testMerchants[identifier]
  },

  getAgent: function (identifier) {
    if (!testAgents[identifier]) {
      testAgents[identifier] = {
        phoneNumber: '1' + this.generateRandomNumber().toString().slice(-8),
        firstName: 'firstName' + this.generateRandomNumber(),
        lastName: 'lastName' + this.generateRandomNumber(),
        dob: '1911-11-11',
        nationalId: this.generateRandomNumber().toString(),
        accountName: this.generateRandomNumber().toString(),
        role: '3',
        roleName: 'agent',
        identifier: this.generateRandomNumber().toString(),
        identifierTypeCode: 'tel',
        password: '1234'
      }
    }

    return testAgents[identifier]
  },

  getConnector: function (identifier) {
    if (!testConnectors[identifier]) {
      testConnectors[identifier] = {
        phoneNumber: '1' + this.generateRandomNumber().toString().slice(-8),
        firstName: 'firstName' + this.generateRandomNumber(),
        lastName: 'lastName' + this.generateRandomNumber(),
        dob: '1911-11-11',
        nationalId: this.generateRandomNumber().toString(),
        accountName: this.generateRandomNumber().toString(),
        role: '3',
        identifier: this.generateRandomNumber().toString(),
        identifierTypeCode: 'tel',
        password: '1234',
        accountTypeId: 6
      }
    }

    return testConnectors[identifier]
  },

  generateBulkPayments: function (customers) {
    let payments = []
    for (let i = 0; i < customers.length; i++) {
      payments.push({
        sequenceNumber: i,
        identifier: customers[i].phoneNumber,
        firstName: customers[i].firstName,
        lastName: customers[i].lastName,
        dob: customers[i].dob,
        nationalId: customers[i].nationalId,
        amount: i + 1000
      })
    }
    return JSON.stringify(payments)
  }
}

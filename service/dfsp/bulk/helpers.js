var fieldsToCheck = ['firstName', 'lastName', 'dob', 'nationalId']
module.exports = {
  checkPaymentDetails: function (payment, payee) {
    var mismatch = fieldsToCheck.filter(function (field) {
      return payment[field] !== payee.dfsp_details[field]
    })
    if (mismatch.length) {
      return mismatch.join(', ') + (mismatch.length === 1 ? ' doesn\'t match' : ' don\'t match')
    }
    return ''
  }
}

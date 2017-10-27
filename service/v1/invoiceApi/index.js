module.exports = require('../../resthooks')([
  require('./addStandardInvoice'),
  require('./addPendingInvoice'),
  require('./addProductInvoice'),
  require('./getMerchant'),
  require('./getInvoiceInfo'),
  require('./payInvoice'),
  require('./getInvoiceFees')
])

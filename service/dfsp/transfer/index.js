module.exports = require('../../resthooks')([
  require('./transfer.execute'),
  require('./invoiceNotification.add'),
  require('./invoiceNotification.reject'),
  require('./invoice.add'),
  require('./invoicePayer.fetch'),
  require('./invoice.cancel'),
  require('./invoice.execute'),
  require('./invoice.get')
])

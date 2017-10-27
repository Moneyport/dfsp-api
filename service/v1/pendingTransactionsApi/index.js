module.exports = require('../../resthooks')([
  require('./getInvoiceNotificationList'),
  require('./getInvoiceInfo'),
  require('./payInvoiceNotification'),
  require('./rejectInvoiceNotification'),
  require('./getClient'),
  require('./postInvoice')
])

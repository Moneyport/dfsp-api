var joi = require('joi')
module.exports = {
  rest: {
    rpc: 'pendingTransactionsApi.client.get',
    path: '/v1/client/{identifier}',
    config: {
      description: 'Lookup default account for a given identifier',
      notes: 'It will check in the central directory to find information about the user',
      tags: ['api', 'pendingTransactions', 'v1', 'getClient'],
      validate: {
        params: joi.object({
          identifier: joi.number().description('Identifier').example(26547070).required()
        })
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Client information',
              schema: joi.object({
                firstName: joi.string().description('Client first name'),
                lastName: joi.string().description('Client last name'),
                imageUrl: joi.string().description('Image URL')
              })
            }
          }
        }
      }
    },
    method: 'get'
  },
  'client.get': function (msg) {
    return this.bus.importMethod('ist.directory.user.get')({
      identifier: msg.identifier
    })
    .then(res => {
      return {
        firstName: res.dfsp_details.firstName,
        lastName: res.dfsp_details.lastName,
        imageUrl: res.dfsp_details.imageUrl
      }
    })
  }
}

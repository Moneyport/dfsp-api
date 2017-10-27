module.exports = {
  rest: {
    rpc: 'samples.get',
    path: '/samples',
    config: {
      description: 'TODO: description',
      notes: 'TODO: note',
      tags: ['api', 'samples']
    },
    method: 'get'
  },
  'get': function (msg, $meta) {
    return this.bus.importMethod('samples.getData')({})
      .then((data) => {
        return Promise.all(data.map((sample) => {
          return this.bus.importMethod('payee.get')({
            payee: sample.phoneNumber
          })
          .then((res) => {
            return Object.assign(res, sample)
          })
        }))
      })
  }
}

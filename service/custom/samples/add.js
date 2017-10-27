module.exports = {
  rest: {
    rpc: 'samples.add',
    path: '/samples',
    config: {
      description: 'TODO: description',
      notes: 'TODO: note',
      tags: ['api', 'samples']
    },
    method: 'post'
  },
  'add': function (msg, $meta) {
    var getSamples = this.bus.importMethod('samples.get')
    return getSamples({})
      .then((res) => {
        return res
      })
      .catch(() => {
        return this.bus.importMethod('samples.getData')({})
          .then((samples) => {
            return Promise.all(samples.map((data) => {
              return this.bus.importMethod('wallet.add')(data)
            }))
          })
          .then(getSamples)
      })
  }
}

var samples = require('./data.json')
module.exports = {
  'getData': function (msg, $meta) {
    var data = samples[this.bus.config.cluster] || samples['dfsp2']
    // if (this.bus.config.spsp && this.bus.config.spsp.url && this.bus.config.spsp.url.startsWith('http://localhost')) {
    //   data.forEach((sample) => {
    //     sample.identifier = sample.firstName
    //   })
    // }
    return data
  }
}

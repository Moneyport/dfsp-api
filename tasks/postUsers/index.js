module.exports = function (bus) {
  return bus.importMethod('samples.add')({}).then(() => false)
}

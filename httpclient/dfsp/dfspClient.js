module.exports = function (config) {
  config.send = function (msg, $meta) {
    $meta.method = $meta.method.split('/').pop()
    var params = {
      uri: (msg && msg.uri) || `/rpc/${$meta.method}`,
      payload: {
        id: 1,
        jsonrpc: '2.0',
        method: $meta.method,
        params: msg
      }
    }
    if ($meta.method === 'identity.check' && !msg.uri) {
      params.uri = '/login'
    }
    delete msg.uri
    return params
  }
  return config
}

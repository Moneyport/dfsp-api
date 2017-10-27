function validationFailHandler (request, reply, source, error) {
  var response = {}
  if (source === 'params') {
    response.id = 'InvalidUriParameterError'
    response.message = 'id is not a valid paymentId'
  } else {
    response.id = 'InvalidBodyError'
    response.message = 'Body did not match schema'
  }

  response.validationErrors = []
  error.data.details.forEach((err) => {
    response.validationErrors.push({
      message: err.message,
      params: err.context
    })
  })
  return reply(response)
}

function rest (request, reply, method, customReply) {
  // httpserver port should be bound (as this) in order for this method to work
  // Used in case header is "Content-Type: text/plain"
  var payload = {
    id: '1',
    jsonrpc: '2.0.',
    method: method
  }
  if (typeof request.payload === 'string') {
    payload.params = Object.assign({
      plainText: request.payload
    }, request.params)
  } else if (request.payload === null) {
    payload.params = Object.assign({}, request.params)
  } else {
    payload.params = Object.assign({}, request.payload, request.params)
  }
  request.payload = payload
  return this.handler(request, reply, customReply)
}

function defaultReply (reply, response, $meta) {
  if (!response.error) {
    return reply(response, {
      'content-type': 'application/json'
    }, 200)
  }
  return reply({
    id: response.error.type,
    message: response.error.message
  }, {
    'content-type': 'application/json'
  }, (response.debug && response.debug.statusCode) || 400)
}

module.exports = function (methods) {
  var spec = {
    rest: [],
    hooks: {}
  }
  methods.forEach(function (method) {
    if (method.rest) {
      if (!method.rest.reply) {
        method.rest.reply = defaultReply
      }
      if (method.rest.config && method.rest.config.validate && !method.rest.config.validate.failAction) {
        method.rest.config.validate.failAction = validationFailHandler
      }
      spec.rest.push(method.rest)
    }
    delete method.rest
    Object.assign(spec.hooks, Object.keys(method).reduce((hooks, prop) => {
      if (typeof method[prop] === 'function') {
        hooks[prop] = method[prop]
      }
      return hooks
    }, {}))
  })
  return Object.assign({
    start: function () {
      if (!this.registerRequestHandler) {
        return
      }
      spec.rest.length && this.registerRequestHandler(
        spec.rest.map((route) => {
          return {
            method: route.method,
            path: route.path,
            handler: (request, reply) => rest.call(this, request, reply, route.rpc, route.reply),
            config: Object.assign({
              auth: 'basic'
            }, route.config)
          }
        })
      )
    }
  }, spec.hooks)
}

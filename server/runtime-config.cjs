function parseBackendArgs(argv) {
  let backendEnabled = true
  const args = []
  for (const arg of argv) {
    if (arg === '--backend') backendEnabled = true
    else if (arg === '--no-backend') backendEnabled = false
    else args.push(arg)
  }
  return { backendEnabled, args }
}

function createRuntimeConfigMiddleware(backendEnabled) {
  return (request, response, next) => {
    if (request.url?.split('?')[0] !== '/runtime-config.js') return next()
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.setHeader('Allow', 'GET, HEAD')
      response.writeHead(405).end()
      return
    }
    response
      .writeHead(200)
      .end(request.method === 'HEAD' ? undefined : `window.__QWERTY_RUNTIME_CONFIG__ = ${JSON.stringify({ backendEnabled })};\n`)
  }
}

module.exports = { createRuntimeConfigMiddleware, parseBackendArgs }

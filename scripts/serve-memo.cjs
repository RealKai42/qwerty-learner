const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')
const { authorizeMemoRequest, createMemoMiddleware } = require('../server/memo-api.cjs')
const { createRuntimeConfigMiddleware, parseBackendArgs } = require('../server/runtime-config.cjs')

const { backendEnabled, args } = parseBackendArgs(process.argv.slice(2))
if (args.length) throw new Error(`不支持的参数：${args.join(' ')}。可使用 --backend 或 --no-backend。`)

const root = path.resolve(__dirname, '..')
const build = path.join(root, 'build')
const host = process.env.MEMO_HOST || '127.0.0.1'
const port = Number(process.env.PORT || 5173)
if (backendEnabled && !['127.0.0.1', 'localhost', '::1'].includes(host) && !process.env.MEMO_ACCESS_PASSWORD) {
  throw new Error('远程访问需要配置 MEMO_ACCESS_PASSWORD；本机使用请保留默认 MEMO_HOST。')
}
if (!fs.existsSync(path.join(build, 'index.html'))) throw new Error('请先运行 npm run build。')
const middleware = createMemoMiddleware({ root, enabled: backendEnabled })
const runtimeConfig = createRuntimeConfigMiddleware(backendEnabled)
const contentTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
}

const server = http.createServer((request, response) => {
  try {
    if (backendEnabled && !authorizeMemoRequest(request, response)) return
    runtimeConfig(request, response, () =>
      middleware(request, response, () => {
        if (!['GET', 'HEAD'].includes(request.method)) return response.writeHead(405).end()
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
        let filename = path.resolve(build, '.' + pathname)
        if (!filename.startsWith(build + path.sep) && filename !== build) return response.writeHead(403).end()
        if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
          if (path.extname(pathname)) return response.writeHead(404).end()
          filename = path.join(build, 'index.html')
        }
        response.setHeader('Content-Type', contentTypes[path.extname(filename)] || 'application/octet-stream')
        response.setHeader('X-Content-Type-Options', 'nosniff')
        response.setHeader('Cache-Control', 'no-cache')
        if (request.method === 'HEAD') return response.end()
        const stream = fs.createReadStream(filename)
        stream.on('error', () => response.destroy())
        stream.pipe(response)
      }),
    )
  } catch {
    response.writeHead(400).end('Bad request')
  }
})
server.listen(port, host, () =>
  console.log(`Qwerty Learner (${backendEnabled ? 'backend' : 'frontend only'}): http://${host}:${server.address().port}`),
)

const { gzipSync } = require('node:zlib')
const { loadWordIndex } = require('./memo-word-index.cjs')

function memoDictionaryPlugin(root) {
  let pending
  const filename = 'memo-word-index.json.gz'
  const compressedIndex = () => {
    pending ||= loadWordIndex(root)
      .then((index) => gzipSync(JSON.stringify(Object.fromEntries(index))))
      .catch((error) => {
        pending = undefined
        throw error
      })
    return pending
  }
  return {
    name: 'memo-static-dictionary',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split('?')[0] !== '/' + filename) return next()
        if (!['GET', 'HEAD'].includes(request.method)) return response.writeHead(405).end()
        try {
          const content = await compressedIndex()
          response.setHeader('Content-Type', 'application/gzip')
          response.setHeader('Cache-Control', 'no-cache')
          response.writeHead(200).end(request.method === 'HEAD' ? undefined : content)
        } catch {
          response.writeHead(500).end('词库索引加载失败。')
        }
      })
    },
    async generateBundle() {
      this.emitFile({ type: 'asset', fileName: filename, source: await compressedIndex() })
    },
  }
}

module.exports = memoDictionaryPlugin

const { timingSafeEqual } = require('node:crypto')
const http = require('node:http')
const https = require('node:https')
const { MemoError } = require('./memo-error.cjs')
const { createMemoSettingsStore } = require('./memo-settings.cjs')
const { loadWordIndex } = require('./memo-word-index.cjs')

const API_BASE = 'https://open.maimemo.com/open/api/v1'
const API_PATH = '/api/memo/today'
const SETTINGS_PATH = '/api/memo/settings'

function beijingDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(date.getTime() - 4 * 60 * 60 * 1000),
  )
}

function requestMemo(endpoint, token, body) {
  // Node 24's proxy support preserves the environment's proxy and CA trust.
  if (process.env.HTTPS_PROXY || process.env.https_proxy) {
    if (!http.setGlobalProxyFromEnv) throw new MemoError('代理环境下请使用 Node.js 24.5 或更新版本运行墨墨服务。', 503)
    http.setGlobalProxyFromEnv()
  }
  return new Promise((resolve, reject) => {
    const request = https.request(
      API_BASE + endpoint,
      { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
      (response) => {
        let raw = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          raw += chunk
          if (raw.length > 4 * 1024 * 1024) request.destroy(new Error('Response too large'))
        })
        response.on('error', () => reject(new MemoError('墨墨响应中断，请重试。')))
        response.on('end', () => {
          if (response.statusCode === 401 || response.statusCode === 403) {
            reject(new MemoError('墨墨凭证已过期或无权访问，请在墨墨设置中更新 Token。', 401))
          } else if (response.statusCode === 429) {
            reject(new MemoError('墨墨请求次数过多，请稍后重试。', 429))
          } else if (response.statusCode !== 200) {
            reject(new MemoError('墨墨服务暂时不可用，请稍后重试。'))
          } else {
            try {
              const result = JSON.parse(raw)
              if (result.success === false || !result.data) throw new Error('Invalid API response')
              resolve(result.data)
            } catch {
              reject(new MemoError('墨墨未返回有效学习数据，请确认 App 已开启自动同步，并在今天打开过 App。'))
            }
          }
        })
      },
    )
    request.setTimeout(20000, () => request.destroy(new Error('Timeout')))
    request.on('error', () => reject(new MemoError('连接墨墨失败，请检查网络后重试。')))
    request.end(JSON.stringify(body))
  })
}

function createTodayLoader({
  root,
  env = process.env,
  request = requestMemo,
  now = () => new Date(),
  settings = createMemoSettingsStore({ root, env }),
}) {
  let indexPromise
  let pending
  return async function loadToday() {
    const token = await settings.getToken()
    if (pending?.token === token) return pending.promise
    const operation = (async () => {
      if (!token) throw new MemoError('尚未配置墨墨账号，请先在设置 → 墨墨设置中保存 Token。', 503)
      const date = beijingDate(now())
      const [data, progressData] = await Promise.all([
        request('/study/get_today_items', token, { is_finished: true, limit: 1000 }),
        request('/study/get_study_progress', token, {}),
      ])
      if (date !== beijingDate(now())) throw new MemoError('导入过程中已跨过北京时间 04:00，请重新读取今日词汇。', 409)
      if (!Array.isArray(data.today_items) || !Number.isInteger(progressData.progress?.finished)) {
        throw new MemoError('墨墨学习数据格式已变化，请稍后重试。')
      }
      const unique = new Map()
      for (const item of data.today_items) {
        if (item.is_finished !== true) continue
        if (typeof item.voc_id !== 'string' || typeof item.voc_spelling !== 'string' || !item.voc_spelling.trim()) {
          throw new MemoError('墨墨返回的单词数据不完整，本次未导入。')
        }
        unique.set(item.voc_id, item)
      }
      if (data.today_items.length >= 1000 || progressData.progress.finished > unique.size) {
        throw new MemoError('今日词汇可能尚未同步完整，或超出接口 1000 词上限。请同步 App 后重试，本次未导入。', 409)
      }
      indexPromise ||= loadWordIndex(root).catch((error) => {
        indexPromise = undefined
        throw error
      })
      const index = await indexPromise
      const items = [...unique.values()]
        .sort((a, b) => a.order - b.order)
        .map((item) => {
          const name = item.voc_spelling.trim()
          const entry = index.get(name.toLowerCase())
          return {
            vocId: item.voc_id,
            response: item.first_response || 'STUDY_RESPONSE_UNSPECIFIED',
            isNew: item.is_new === true,
            word: { name, trans: entry?.trans || [], usphone: entry?.usphone || '', ukphone: entry?.ukphone || '' },
          }
        })
      const fetchedAt = now()
      if (date !== beijingDate(fetchedAt)) throw new MemoError('导入过程中已跨过北京时间 04:00，请重新读取今日词汇。', 409)
      return { date, fetchedAt: fetchedAt.toISOString(), items, completed: progressData.progress.finished }
    })().finally(() => {
      if (pending?.promise === operation) pending = undefined
    })
    pending = { token, promise: operation }
    return operation
  }
}

function safeEqual(left, right) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

function authorizeMemoRequest(request, response, env = process.env) {
  const origin = request.headers.origin
  if ((origin && new URL(origin).host !== request.headers.host) || request.headers['sec-fetch-site'] === 'cross-site') {
    response.writeHead(403).end('Forbidden')
    return false
  }
  if (env.MEMO_ACCESS_PASSWORD) {
    const expected = 'Basic ' + Buffer.from(`memo:${env.MEMO_ACCESS_PASSWORD}`).toString('base64')
    if (!safeEqual(request.headers.authorization || '', expected)) {
      response.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Personal vocabulary", charset="UTF-8"', 'Cache-Control': 'no-store' })
      response.end('请使用个人访问密码登录，用户名为 memo。')
      return false
    }
  } else {
    const remote = request.socket.remoteAddress
    const hostname = (request.headers.host || '').replace(/:\d+$/, '')
    if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(remote) || !['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
      response.writeHead(403).end('仅允许本机访问。远程使用请配置 MEMO_ACCESS_PASSWORD。')
      return false
    }
  }
  return true
}

function createMemoMiddleware(options) {
  const enabled = options.enabled !== false
  const settings = enabled ? options.settings || createMemoSettingsStore({ root: options.root || process.cwd(), env: options.env }) : null
  const loadToday = enabled ? options.loadToday || createTodayLoader({ ...options, settings }) : null
  return async function memoMiddleware(request, response, next) {
    // Vite serves project files during development; never expose the private configuration.
    let decodedPath
    try {
      decodedPath = decodeURIComponent(request.url?.split('?')[0] || '')
    } catch {
      response.writeHead(400).end('Bad request')
      return
    }
    if (/(^|[/\\])\.memo-settings\.(json|[^/\\]+\.tmp)(?:$|[/\\])/i.test(decodedPath)) {
      response.writeHead(403, { 'Cache-Control': 'no-store' }).end('Forbidden')
      return
    }
    const pathname = request.url?.split('?')[0]
    if (pathname !== API_PATH && pathname !== SETTINGS_PATH) return next()
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    if (!enabled) {
      response.writeHead(404).end(JSON.stringify({ error: '墨墨后端未启用。' }))
      return
    }
    try {
      if (!authorizeMemoRequest(request, response, options.env)) return
      if (pathname === SETTINGS_PATH) {
        let data
        if (request.method === 'GET') data = await settings.getStatus()
        else if (request.method === 'DELETE') data = await settings.clear()
        else if (request.method === 'POST') {
          if (!request.headers['content-type']?.startsWith('application/json')) throw new MemoError('请使用 JSON 保存墨墨设置。', 415)
          const body = await readSettingsBody(request)
          data = await settings.save(body?.token)
        } else {
          response.setHeader('Allow', 'GET, POST, DELETE')
          throw new MemoError('不支持的墨墨设置操作。', 405)
        }
        request.resume()
        response.writeHead(200).end(JSON.stringify(data))
        return
      }
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST')
        response.writeHead(405).end(JSON.stringify({ error: '请使用导入按钮读取今日词汇。' }))
        return
      }
      request.resume()
      const data = await loadToday()
      response.writeHead(200).end(JSON.stringify(data))
    } catch (error) {
      response.writeHead(error instanceof MemoError ? error.status : 500)
      response.end(JSON.stringify({ error: error instanceof MemoError ? error.message : '读取词汇失败，请稍后重试。' }))
    }
  }
}

function readSettingsBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''
    let size = 0
    let rejected = false
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > 8192) {
        rejected = true
        reject(new MemoError('Token 配置内容过长。', 413))
      } else body += chunk.toString('utf8')
    })
    request.on('end', () => {
      if (rejected) return
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new MemoError('Token 配置格式不正确。', 400))
      }
    })
    request.on('error', () => reject(new MemoError('读取 Token 配置失败，请重试。', 400)))
  })
}

module.exports = { API_PATH, MemoError, authorizeMemoRequest, beijingDate, createMemoMiddleware, createTodayLoader }

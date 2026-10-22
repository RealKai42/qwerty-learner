const { timingSafeEqual } = require('node:crypto')
const fs = require('node:fs/promises')
const http = require('node:http')
const https = require('node:https')
const path = require('node:path')

const API_BASE = 'https://open.maimemo.com/open/api/v1'
const API_PATH = '/api/memo/today'

class MemoError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.status = status
  }
}

function beijingDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
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
            reject(new MemoError('墨墨凭证已过期或无权访问，请更新服务端的 memo_token。', 401))
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

async function loadWordIndex(root) {
  const directory = path.join(root, 'public/dicts')
  const preferred = ['CET4_T.json', 'CET6_T.json', 'IELTS_T.json', 'TOEFL_T.json']
  const files = (await fs.readdir(directory)).filter((name) => name.endsWith('.json')).sort()
  const ordered = [...preferred.filter((name) => files.includes(name)), ...files.filter((name) => !preferred.includes(name))]
  const index = new Map()
  for (const filename of ordered) {
    const entries = JSON.parse(await fs.readFile(path.join(directory, filename), 'utf8'))
    if (!Array.isArray(entries)) continue
    for (const entry of entries) {
      if (!entry || typeof entry.name !== 'string' || !/^[a-z]/i.test(entry.name)) continue
      const key = entry.name.trim().toLowerCase()
      const existing = index.get(key) || { trans: [], usphone: '', ukphone: '' }
      if (!existing.trans.length && Array.isArray(entry.trans)) existing.trans = entry.trans.filter((item) => typeof item === 'string')
      if (!existing.usphone && typeof entry.usphone === 'string') existing.usphone = entry.usphone
      if (!existing.ukphone && typeof entry.ukphone === 'string') existing.ukphone = entry.ukphone
      index.set(key, existing)
    }
  }
  return index
}

function createTodayLoader({ root, env = process.env, request = requestMemo, now = () => new Date() }) {
  let indexPromise
  let pending
  return function loadToday() {
    if (pending) return pending
    pending = (async () => {
      const token = env.memo_token || env.MAIMEMO_TOKEN
      if (!token) throw new MemoError('尚未配置墨墨账号，请在服务端设置 memo_token 后重启。', 503)
      const date = beijingDate(now())
      const [data, progressData] = await Promise.all([
        request('/study/get_today_items', token, { is_finished: true, limit: 1000 }),
        request('/study/get_study_progress', token, {}),
      ])
      if (date !== beijingDate(now())) throw new MemoError('导入过程中已跨过北京时间零点，请重新读取今日词汇。', 409)
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
      return { date, fetchedAt: now().toISOString(), items, completed: progressData.progress.finished }
    })().finally(() => {
      pending = undefined
    })
    return pending
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
  const loadToday = options.loadToday || createTodayLoader(options)
  return async function memoMiddleware(request, response, next) {
    if (request.url?.split('?')[0] !== API_PATH) return next()
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    try {
      if (!authorizeMemoRequest(request, response, options.env)) return
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

module.exports = { API_PATH, MemoError, authorizeMemoRequest, beijingDate, createMemoMiddleware, createTodayLoader }

const assert = require('node:assert/strict')
const { mkdtemp, mkdir, writeFile, rm } = require('node:fs/promises')
const http = require('node:http')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')
const { beijingDate, createMemoMiddleware, createTodayLoader, MemoError } = require('../server/memo-api.cjs')

const todayItems = [
  { voc_id: 'b', voc_spelling: 'banana', order: 2, first_response: 'VAGUE', is_new: true, is_finished: true },
  { voc_id: 'a', voc_spelling: 'apple', order: 1, first_response: 'FORGET', is_new: false, is_finished: true },
  { voc_id: 'c', voc_spelling: 'unknownword', order: 3, first_response: 'FAMILIAR', is_new: false, is_finished: true },
  { voc_id: 'pending', voc_spelling: 'pending', order: 4, first_response: 'FORGET', is_new: false, is_finished: false },
]

async function loaderFixture(t, options = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'qwerty-memo-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(path.join(root, 'public/dicts'), { recursive: true })
  await writeFile(
    path.join(root, 'public/dicts/CET4_T.json'),
    JSON.stringify([
      { name: 'apple', trans: ['苹果'], usphone: 'apple-us', ukphone: 'apple-uk' },
      { name: 'banana', trans: ['香蕉'], usphone: 'banana-us', ukphone: 'banana-uk' },
    ]),
  )
  const calls = []
  const request = async (endpoint, token, body) => {
    calls.push({ endpoint, token, body })
    return endpoint.endsWith('get_today_items') ? { today_items: todayItems } : { progress: { finished: 3 } }
  }
  return { load: createTodayLoader({ root, env: { memo_token: 'test-token' }, request, ...options }), calls }
}

test('uses Beijing day at the UTC boundary', () => {
  assert.equal(beijingDate(new Date('2026-10-22T15:59:59Z')), '2026-10-22')
  assert.equal(beijingDate(new Date('2026-10-22T16:00:00Z')), '2026-10-23')
})

test('requests completed new and review words, deduplicates, sorts and enriches', async (t) => {
  const { load, calls } = await loaderFixture(t)
  const result = await load()
  assert.deepEqual(calls[0].body, { is_finished: true, limit: 1000 })
  assert.equal(calls[0].token, 'test-token')
  assert.deepEqual(
    result.items.map((item) => item.word.name),
    ['apple', 'banana', 'unknownword'],
  )
  assert.deepEqual(result.items[0].word.trans, ['苹果'])
  assert.equal(result.items[1].isNew, true)
  assert.deepEqual(result.items[2].word.trans, [])
  assert.equal(JSON.stringify(result).includes('test-token'), false)
})

test('concurrent import reads share the same upstream request', async (t) => {
  const { load, calls } = await loaderFixture(t)
  const [left, right] = await Promise.all([load(), load()])
  assert.deepEqual(left, right)
  assert.equal(calls.length, 2)
})

test('missing credentials stop before accessing the upstream API', async (t) => {
  const { load, calls } = await loaderFixture(t, { env: {} })
  await assert.rejects(load, (error) => error.status === 503)
  assert.equal(calls.length, 0)
})

test('refuses incomplete results instead of saving a partial wordbook', async (t) => {
  const { load } = await loaderFixture(t, {
    request: async (endpoint) => (endpoint.endsWith('get_today_items') ? { today_items: todayItems } : { progress: { finished: 4 } }),
  })
  await assert.rejects(load, (error) => error.status === 409)
})

test('refuses the API cap even if the upstream count is stale', async (t) => {
  const { load } = await loaderFixture(t, {
    request: async (endpoint) =>
      endpoint.endsWith('get_today_items')
        ? { today_items: Array.from({ length: 1000 }, (_, i) => ({ ...todayItems[0], voc_id: String(i) })) }
        : { progress: { finished: 1000 } },
  })
  await assert.rejects(load, (error) => error.status === 409)
})

test('crossing midnight invalidates the snapshot', async (t) => {
  let count = 0
  const { load } = await loaderFixture(t, { now: () => new Date(count++ === 0 ? '2026-10-22T15:59:59Z' : '2026-10-22T16:00:01Z') })
  await assert.rejects(load, (error) => error.status === 409)
})

test('empty completed list is a valid preview', async (t) => {
  const { load } = await loaderFixture(t, {
    request: async (endpoint) => (endpoint.endsWith('get_today_items') ? { today_items: [] } : { progress: { finished: 0 } }),
  })
  assert.deepEqual((await load()).items, [])
})

async function apiFixture(t, options = {}) {
  const middleware = createMemoMiddleware({ env: {}, loadToday: async () => ({ items: [] }), ...options })
  const server = http.createServer((request, response) => middleware(request, response, () => response.writeHead(404).end()))
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => {
    server.closeAllConnections()
    server.close()
  })
  const url = `http://127.0.0.1:${server.address().port}/api/memo/today`
  return (init = {}) =>
    new Promise((resolve, reject) => {
      const request = http.request(url, { method: 'POST', ...init }, (response) => {
        let body = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          body += chunk
        })
        response.on('end', () => resolve(new globalThis.Response(body, { status: response.statusCode, headers: response.headers })))
      })
      request.on('error', reject)
      request.end()
    })
}

test('API allows local same-origin reads and disables caching', async (t) => {
  const request = await apiFixture(t)
  const response = await request()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('API rejects cross-site requests and DNS-rebinding hostnames', async (t) => {
  const request = await apiFixture(t)
  assert.equal((await request({ headers: { Origin: 'https://example.com' } })).status, 403)
  assert.equal((await request({ headers: { Host: 'attacker.example' } })).status, 403)
})

test('remote mode requires the configured personal password', async (t) => {
  const request = await apiFixture(t, { env: { MEMO_ACCESS_PASSWORD: 'test-password' } })
  assert.equal((await request()).status, 401)
  assert.equal((await request({ headers: { Authorization: 'Basic ' + Buffer.from('memo:test-password').toString('base64') } })).status, 200)
})

test('API rejects GET and sanitizes unexpected errors', async (t) => {
  const request = await apiFixture(t, {
    loadToday: async () => {
      throw new Error('sensitive-upstream-value')
    },
  })
  assert.equal((await request({ method: 'GET' })).status, 405)
  const response = await request()
  assert.equal(response.status, 500)
  assert.equal((await response.text()).includes('sensitive-upstream-value'), false)
})

test('API preserves actionable failure messages', async (t) => {
  const request = await apiFixture(t, {
    loadToday: async () => {
      throw new MemoError('请更新凭证', 401)
    },
  })
  const response = await request()
  assert.equal(response.status, 401)
  assert.equal((await response.json()).error, '请更新凭证')
})

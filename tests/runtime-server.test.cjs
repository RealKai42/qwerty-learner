const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { once } = require('node:events')
const fs = require('node:fs/promises')
const path = require('node:path')
const test = require('node:test')
const vm = require('node:vm')
const { gunzipSync } = require('node:zlib')

const root = path.resolve(__dirname, '..')

async function start(t, flag) {
  const child = spawn(process.execPath, ['scripts/serve-memo.cjs', flag], {
    cwd: root,
    env: { ...process.env, PORT: '0', MEMO_HOST: '127.0.0.1', MEMO_ACCESS_PASSWORD: 'runtime-test-password' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  t.after(async () => {
    if (child.exitCode === null) {
      const exited = once(child, 'exit')
      child.kill()
      await exited
    }
  })
  const url = await new Promise((resolve, reject) => {
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk
      const match = output.match(/http:\/\/127\.0\.0\.1:\d+/)
      if (match) resolve(match[0])
    })
    child.once('error', reject)
    child.once('exit', (code) => reject(new Error(`Personal server exited: ${code}`)))
  })
  return (pathname, init = {}) => fetch(url + pathname, init)
}

for (const backendEnabled of [true, false]) {
  test(`one production build starts with backend=${backendEnabled}`, { timeout: 15000 }, async (t) => {
    const request = await start(t, backendEnabled ? '--backend' : '--no-backend')
    const headers = { Authorization: 'Basic ' + Buffer.from('memo:runtime-test-password').toString('base64') }
    assert.equal((await request('/')).status, backendEnabled ? 401 : 200)
    const page = await request('/gallery', { headers })
    assert.equal(page.status, 200)
    assert.match(await page.text(), /runtime-config\.js/)
    const config = await request('/runtime-config.js', { headers })
    assert.equal(config.headers.get('cache-control'), 'no-store')
    const context = { window: {} }
    vm.runInNewContext(await config.text(), context)
    assert.equal(context.window.__QWERTY_RUNTIME_CONFIG__.backendEnabled, backendEnabled)
    assert.equal((await request('/api/memo/settings', { headers })).status, backendEnabled ? 200 : 404)
    if (!backendEnabled) {
      assert.equal((await request('/api/memo/today', { method: 'POST' })).status, 404)
      assert.equal((await request('/api/memo/settings', { method: 'DELETE' })).status, 404)
      assert.equal((await request('/.memo-settings.json')).status, 403)
      const dictionary = await request('/memo-word-index.json.gz')
      assert.equal(dictionary.status, 200)
      const index = JSON.parse(gunzipSync(await dictionary.arrayBuffer()).toString())
      assert.equal(
        index.apple.trans.some((value) => value.includes('苹果')),
        true,
      )
    }
  })
}

test('static build defaults to frontend only', async () => {
  const context = { window: {} }
  vm.runInNewContext(await fs.readFile(path.join(root, 'build/runtime-config.js'), 'utf8'), context)
  assert.equal(context.window.__QWERTY_RUNTIME_CONFIG__.backendEnabled, false)
})

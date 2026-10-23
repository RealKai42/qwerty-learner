const { randomUUID } = require('node:crypto')
const fs = require('node:fs/promises')
const path = require('node:path')
const { MemoError } = require('./memo-error.cjs')

function createMemoSettingsStore({ root, env = process.env }) {
  const filename = path.join(root, '.memo-settings.json')
  let pendingRead
  function read() {
    if (pendingRead) return pendingRead
    const operation = (async () => {
      let data
      try {
        data = JSON.parse(await fs.readFile(filename, 'utf8'))
        if (!data || !(data.token === null || typeof data.token === 'string')) throw new Error('Invalid configuration')
      } catch (error) {
        if (error.code === 'ENOENT') {
          const token = env.memo_token || env.MAIMEMO_TOKEN || ''
          return { token, source: token ? 'environment' : 'none' }
        }
        throw new MemoError('墨墨配置无法读取，请在墨墨设置中重新保存 Token。', 503)
      }
      return { token: data.token || '', source: data.token ? 'saved' : 'none' }
    })().finally(() => {
      if (pendingRead === operation) pendingRead = undefined
    })
    pendingRead = operation
    return operation
  }
  async function status() {
    const config = await read()
    return { configured: Boolean(config.token), source: config.source }
  }
  async function write(token) {
    const temporary = path.join(root, `.memo-settings.${randomUUID()}.tmp`)
    try {
      await fs.writeFile(temporary, JSON.stringify({ token }), { flag: 'wx', mode: 0o600 })
      await fs.rename(temporary, filename)
      pendingRead = undefined
    } catch {
      throw new MemoError('无法保存墨墨设置，请检查个人服务目录是否可写。', 503)
    } finally {
      await fs.rm(temporary, { force: true }).catch(() => {})
    }
    return status()
  }
  return {
    getToken: async () => (await read()).token,
    getStatus: status,
    save: async (value) => {
      if (typeof value !== 'string') throw new MemoError('请输入有效的墨墨 Token。', 400)
      const token = value.trim().replace(/^Bearer\s+/i, '')
      if (!token || token.length > 4096 || /[^\x21-\x7e]/.test(token)) throw new MemoError('Token 格式不正确，请重新复制。', 400)
      return write(token)
    },
    // An explicit clear also disables an environment-variable fallback without modifying the environment.
    clear: () => write(null),
  }
}

module.exports = { createMemoSettingsStore }

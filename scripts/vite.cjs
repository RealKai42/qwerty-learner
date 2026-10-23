const { spawn } = require('node:child_process')
const path = require('node:path')
const { parseBackendArgs } = require('../server/runtime-config.cjs')

const { backendEnabled, args } = parseBackendArgs(process.argv.slice(2))
const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin/vite.js')
const child = spawn(process.execPath, [vite, ...args], {
  stdio: 'inherit',
  env: { ...process.env, QWERTY_BACKEND: backendEnabled ? '1' : '0' },
})
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
child.on('error', (error) => {
  console.error(error.message)
  process.exitCode = 1
})
child.on('exit', (code, signal) => process.exit(code ?? (signal === 'SIGINT' ? 130 : 143)))

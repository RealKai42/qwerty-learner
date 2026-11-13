import react from '@vitejs/plugin-react'
import { getLastCommit } from 'git-last-commit'
import jotaiDebugLabel from 'jotai/babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh'
import path from 'node:path'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import type { PluginOption } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // rollup-plugin-visualizer is ESM-only, keep it dynamic so the config can be loaded by require
  const { visualizer } = await import('rollup-plugin-visualizer')
  const latestCommitHash = await new Promise<string>((resolve) => {
    return getLastCommit((err, commit) => (err ? 'unknown' : resolve(commit.shortHash)))
  })
  return {
    plugins: [
      react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }),
      visualizer() as PluginOption,
      Icons({ compiler: 'jsx', jsx: 'react' }),
    ],
    build: {
      minify: true,
      outDir: 'build',
      sourcemap: false,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'react-vendor',
                test: /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|react-app-polyfill)\//,
              },
              {
                name: 'ui-vendor',
                test: /node_modules\/(?:@radix-ui|@headlessui|@floating-ui|lucide-react|react-tooltip|react-hotkeys-hook|animate\.css)\//,
              },
              { name: 'data-vendor', test: /node_modules\/(dexie|dexie-export-import|pako|swr|jotai|dayjs)\// },
              {
                name: 'i18n-vendor',
                test: /node_modules\/(i18next|react-i18next|i18next-browser-languagedetector|i18next-http-backend)\//,
              },
              { name: 'mixpanel', test: /node_modules\/mixpanel-browser\// },
            ],
          },
        },
      },
    },
    oxc: {
      drop: mode === 'development' ? [] : ['console', 'debugger'],
    },
    define: {
      REACT_APP_DEPLOY_ENV: JSON.stringify(process.env.REACT_APP_DEPLOY_ENV),
      LATEST_COMMIT_HASH: JSON.stringify(latestCommitHash + (process.env.NODE_ENV === 'production' ? '' : ' (dev)')),
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
      },
    },
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  }
})

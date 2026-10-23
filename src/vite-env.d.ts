/// <reference types="vite/client" />
declare const REACT_APP_DEPLOY_ENV: string
declare const LATEST_COMMIT_HASH: string

interface Window {
  __QWERTY_RUNTIME_CONFIG__?: { backendEnabled: boolean }
}

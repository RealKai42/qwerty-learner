import type { WebDAVConfig } from '@/utils/webdav'
import { defaultWebdavConfig, loadWebdavSettings, saveWebdavSettings } from '@/utils/webdavSettings'
import { atom } from 'jotai'

const stateAtom = atom({ config: defaultWebdavConfig, ready: false })
let revision = 0

stateAtom.onMount = (setState) => {
  let active = true
  const initialRevision = revision
  void loadWebdavSettings()
    .then((config) => {
      if (active && revision === initialRevision) setState({ config, ready: true })
    })
    .catch((error) => {
      console.error('Failed to load WebDAV settings', error)
      if (active) setState((previous) => ({ ...previous, ready: true }))
    })
  return () => {
    active = false
  }
}

export const webdavConfigReadyAtom = atom((get) => get(stateAtom).ready)

export const webdavConfigAtom = atom(
  (get) => get(stateAtom).config,
  async (get, set, update: WebDAVConfig | ((previous: WebDAVConfig) => WebDAVConfig)) => {
    const config = typeof update === 'function' ? update(get(stateAtom).config) : update
    revision += 1
    await saveWebdavSettings(config)
    set(stateAtom, { config, ready: true })
  },
)

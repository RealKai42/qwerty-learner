import type { WritableAtom } from 'jotai'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { RESET } from 'jotai/vanilla/utils/constants'

type SetStateActionWithReset<Value> = Value | typeof RESET | ((prev: Value) => Value | typeof RESET)

function migrateConfig<T extends Record<string, unknown>>(config: T, defaultValue: T): T | null {
  const isTypeMismatch = typeof config !== typeof defaultValue || Array.isArray(config) !== Array.isArray(defaultValue)

  if (isTypeMismatch) {
    return defaultValue
  }

  let hasMissingProperty = false
  for (const k in defaultValue) {
    if (!(k in config)) {
      hasMissingProperty = true
      break
    }
  }

  const newConfig = hasMissingProperty ? { ...defaultValue, ...config } : config

  for (const k in defaultValue) {
    if (newConfig[k] === undefined) {
      newConfig[k] = defaultValue[k]
    }
  }

  return newConfig !== config ? newConfig : null
}

export default function atomForConfig<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
): WritableAtom<T, [SetStateActionWithReset<T>], void> {
  const storageAtom = atomWithStorage(key, defaultValue)

  // Perform one-time migration in onMount (runs once when atom is first used)
  storageAtom.onMount = (setAtom) => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const config = JSON.parse(raw) as T
        const migrated = migrateConfig(config, defaultValue)
        if (migrated) setAtom(migrated)
      }
    } catch {
      // corrupted localStorage — will fall back to defaultValue
    }
  }

  return atom(
    (get) => get(storageAtom),
    (_get, set, newValue: SetStateActionWithReset<T>) => {
      set(storageAtom, newValue)
    },
  )
}

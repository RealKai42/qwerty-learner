import type { WritableAtom } from 'jotai'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { RESET } from 'jotai/vanilla/utils/constants'

type SetStateActionWithReset<Value> = Value | typeof RESET | ((prev: Value) => Value | typeof RESET)

export default function atomForConfig<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
): WritableAtom<T, [SetStateActionWithReset<T>], void> {
  const storageAtom = atomWithStorage(key, defaultValue)
  return atom((get) => {
    // Get the underlying object
    const config = get(storageAtom)

    let newConfig: T

    // Check if the types are different
    const isTypeMismatch = typeof config !== typeof defaultValue

    if (isTypeMismatch) {
      newConfig = defaultValue
    } else {
      // Check if there are missing properties
      let hasMissingProperty = false
      for (const key in defaultValue) {
        if (!(key in config)) {
          hasMissingProperty = true
          break
        }
      }

      newConfig = hasMissingProperty ? { ...defaultValue, ...config } : config
    }

    if (newConfig !== config) {
      const jsonString = JSON.stringify(newConfig)
      localStorage.setItem(key, jsonString)
    }

    return newConfig
  }, storageAtom.write)
}

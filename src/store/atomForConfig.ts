import { WritableAtom, atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export default function atomForConfig<T extends Record<string, unknown>>(
  key: string,
  defaultValue: T,
): WritableAtom<T, [newConfig: T], void> {
  const storageAtom = atomWithStorage(key, defaultValue)
  return atom(
    (get) => {
      // Get the underlying object
      const config = get(storageAtom)
      // Check if there are missing properties
      let hasMissingProperty = false
      for (const key in defaultValue) {
        if (!(key in config)) {
          hasMissingProperty = true
        }
      }
      // Merge iff there are missing properties
      return hasMissingProperty ? { ...defaultValue, ...config } : config
    },
    (_, set, newConfig: T) => set(storageAtom, newConfig),
  )
}

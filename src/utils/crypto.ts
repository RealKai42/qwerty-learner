/**
 * NOTE: This XOR-based "encryption" is obfuscation, NOT real encryption.
 *
 * XOR with a hardcoded key is trivially reversible — anyone reading the
 * source can decode the stored value. This prevents casual inspection of
 * credentials in localStorage but provides NO protection against anyone
 * with access to the JavaScript runtime or the source code.
 *
 * A production-grade solution would use the Web Crypto API with:
 *   - SubtleCrypto.encrypt() / decrypt() with a key derived from a
 *     per-user secret (e.g., session token or biometric)
 *   - Or server-side credential storage entirely
 *
 * For a client-only offline-first app this is an inherent limitation:
 * any key shipped in the bundle is extractable.
 */
const KEY = 'qwerty-learner-webdav-v1'

function obfuscate(text: string): string {
  const bytes = new TextEncoder().encode(text)
  const keyBytes = new TextEncoder().encode(KEY)
  const result = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ keyBytes[i % keyBytes.length]
  }
  return btoa(String.fromCharCode(...Array.from(result)))
}

function deobfuscate(encoded: string): string {
  const binary = atob(encoded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const keyBytes = new TextEncoder().encode(KEY)
  const result = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ keyBytes[i % keyBytes.length]
  }
  return new TextDecoder().decode(result)
}

export function createEncryptedStorage<T>(
  key: string,
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = localStorage,
): {
  getItem: (k: string, initialValue: T) => T
  setItem: (k: string, value: T) => void
  removeItem: (k: string) => void
} {
  const read = (initialValue: T): T => {
    const stored = storage.getItem(key)
    if (!stored) return initialValue
    try {
      return JSON.parse(deobfuscate(stored)) as T
    } catch {
      return initialValue
    }
  }
  return {
    getItem(_k, initialValue) {
      return read(initialValue)
    },
    setItem(_k, value) {
      storage.setItem(key, obfuscate(JSON.stringify(value)))
    },
    removeItem() {
      storage.removeItem(key)
    },
  }
}

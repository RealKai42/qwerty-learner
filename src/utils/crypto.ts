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

export function createEncryptedStorage<T>(key: string): {
  getItem: (k: string, initialValue: T) => T
  setItem: (k: string, value: T) => void
  removeItem: (k: string) => void
} {
  return {
    getItem(_k, initialValue) {
      const stored = localStorage.getItem(key)
      if (!stored) return initialValue
      try {
        return JSON.parse(deobfuscate(stored)) as T
      } catch {
        return initialValue
      }
    },
    setItem(_k, value) {
      localStorage.setItem(key, obfuscate(JSON.stringify(value)))
    },
    removeItem(_k) {
      localStorage.removeItem(key)
    },
  }
}

declare module 'use-sound' {
  import type { HookOptions, ReturnedValue } from 'use-sound/dist/types'
  export type { HookOptions, ReturnedValue }
  export default function useSound<T = unknown>(url: string, options?: HookOptions<T>): ReturnedValue
}

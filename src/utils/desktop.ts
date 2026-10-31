import { convertFileSrc } from '@tauri-apps/api/core'

export const IS_DESKTOP = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

/**
 * 桌面端把发音地址改指向 `pron://` 自定义协议，由 Rust 侧下载、落盘并复用缓存。
 *
 * 不在前端做 fetch + 缓存，是因为有道不返回 `Access-Control-Allow-Origin`，
 * webview 里读不到响应体；Rust 侧不受同源策略约束。
 * 返回的仍是一个同步可用的 URL，播放器无需改成异步。
 *
 * Web 端原样返回，行为不变。
 */
export function toCachedAudioSrc(remoteUrl: string): string {
  if (!IS_DESKTOP || remoteUrl === '') return remoteUrl

  // 地址里的 ? 和 & 若直接进路径，会被自定义协议解析成它自己的查询串，
  // 因此整体做 base64url 编码后再拼接。
  const encoded = btoa(remoteUrl).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return convertFileSrc(encoded, 'pron')
}

import { atomWithStorage } from 'jotai/utils'

export type GistSyncConfig = {
  /** GitHub Personal Access Token（明文存储，有 gists scope 即可） */
  token: string
  /** 已创建的 Gist ID；首次同步后自动写入 */
  gistId: string
  /** 本地最后一次成功同步的时间戳（UTC ms），0 表示从未同步 */
  lastSyncAt: number
  /** 最后同步时的词典 ID */
  lastSyncDictId: string
  /** 最后同步时的章节（0-based） */
  lastSyncChapter: number
  /** 是否在完成章节后自动上传 */
  autoSync: boolean
}

const DEFAULT_GIST_SYNC_CONFIG: GistSyncConfig = {
  token: '',
  gistId: '',
  lastSyncAt: 0,
  lastSyncDictId: '',
  lastSyncChapter: 0,
  autoSync: false,
}

export const gistSyncConfigAtom = atomWithStorage<GistSyncConfig>('gistSyncConfig', DEFAULT_GIST_SYNC_CONFIG)

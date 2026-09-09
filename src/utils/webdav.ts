export interface WebDAVConfig {
  enabled: boolean
  url: string
  username: string
  password: string
  autoBackup: boolean
}

export interface BackupData {
  backupVersion: string
  backupTime: string
  data: {
    wordRecords: unknown[]
    chapterRecords: unknown[]
    reviewRecords: unknown[]
  }
}

const BACKUP_FILENAME = 'qwerty-learner-backup-latest.json'
const LAST_BACKUP_TIME_KEY = 'webdavLastBackupTime'

function getAuthHeader(config: WebDAVConfig): string {
  return 'Basic ' + btoa(`${config.username}:${config.password}`)
}

function getBackupUrl(config: WebDAVConfig, filename?: string): string {
  const name = filename || BACKUP_FILENAME
  return config.url.endsWith('/') ? config.url + name : `${config.url}/${name}`
}

// timeStamp in db is Unix seconds (not ms), convert to ms for Date comparison
function recordTimestampToDate(ts: number): Date {
  return new Date(ts * 1000)
}

export async function testWebDAVConnection(config: WebDAVConfig): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(config.url, {
      method: 'PROPFIND',
      headers: {
        Authorization: getAuthHeader(config),
        'Content-Type': 'application/xml',
      },
    })

    if (response.ok || response.status === 207) {
      return { success: true, message: '连接成功' }
    }
    return { success: false, message: `连接失败: HTTP ${response.status}` }
  } catch (e) {
    return { success: false, message: `连接失败: ${e instanceof Error ? e.message : String(e)}` }
  }
}

/**
 * 增量备份（自动备份用）：只追加新数据到同一个文件
 */
export async function incrementalBackupToWebDAV(
  data: { wordRecords: unknown[]; chapterRecords: unknown[]; reviewRecords: unknown[] },
  config: WebDAVConfig,
): Promise<{ success: boolean; message: string }> {
  try {
    const lastBackupTime = localStorage.getItem(LAST_BACKUP_TIME_KEY)
    const lastBackupDate = lastBackupTime ? new Date(lastBackupTime) : null

    // Filter incremental data
    const filterNewRecords = (records: unknown[]) => {
      if (!lastBackupDate) return records
      return records.filter((r: unknown) => {
        const record = r as { timeStamp?: number }
        return record.timeStamp && recordTimestampToDate(record.timeStamp) > lastBackupDate
      })
    }

    const incrementalData = {
      wordRecords: filterNewRecords(data.wordRecords),
      chapterRecords: filterNewRecords(data.chapterRecords),
      reviewRecords: filterNewRecords(data.reviewRecords),
    }

    const totalNew =
      incrementalData.wordRecords.length +
      incrementalData.chapterRecords.length +
      incrementalData.reviewRecords.length

    if (totalNew === 0 && lastBackupDate) {
      return { success: true, message: '没有新增数据，跳过备份' }
    }

    // Merge with existing backup
    const existingBackup = await downloadExistingBackup(config)
    const mergedData = existingBackup
      ? {
          wordRecords: [...existingBackup.data.wordRecords, ...incrementalData.wordRecords],
          chapterRecords: [...existingBackup.data.chapterRecords, ...incrementalData.chapterRecords],
          reviewRecords: [...existingBackup.data.reviewRecords, ...incrementalData.reviewRecords],
        }
      : incrementalData

    const backupData: BackupData = {
      backupVersion: '1.0',
      backupTime: new Date().toISOString(),
      data: mergedData,
    }

    const response = await fetch(getBackupUrl(config), {
      method: 'PUT',
      headers: {
        Authorization: getAuthHeader(config),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backupData, null, 2),
    })

    if (response.ok) {
      localStorage.setItem(LAST_BACKUP_TIME_KEY, new Date().toISOString())
      const newCount = totalNew || data.wordRecords.length + data.chapterRecords.length + data.reviewRecords.length
      return { success: true, message: `增量备份成功，新增 ${newCount} 条记录` }
    }
    return { success: false, message: `备份失败: HTTP ${response.status}` }
  } catch (e) {
    return { success: false, message: `备份失败: ${e instanceof Error ? e.message : String(e)}` }
  }
}

/**
 * 完整备份（手动备份用）：创建新的完整备份文件，同时更新 latest.json
 */
export async function fullBackupToWebDAV(
  data: { wordRecords: unknown[]; chapterRecords: unknown[]; reviewRecords: unknown[] },
  config: WebDAVConfig,
): Promise<{ success: boolean; message: string }> {
  try {
    const timestamp = Date.now()
    const filename = `qwerty-learner-backup-${timestamp}.json`
    const backupData: BackupData = {
      backupVersion: '1.0',
      backupTime: new Date().toISOString(),
      data,
    }

    // 创建带时间戳的备份文件
    const response1 = await fetch(getBackupUrl(config, filename), {
      method: 'PUT',
      headers: {
        Authorization: getAuthHeader(config),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backupData, null, 2),
    })

    if (!response1.ok) {
      return { success: false, message: `备份失败: HTTP ${response1.status}` }
    }

    // 同时更新 latest.json（供增量备份使用）
    const response2 = await fetch(getBackupUrl(config), {
      method: 'PUT',
      headers: {
        Authorization: getAuthHeader(config),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backupData, null, 2),
    })

    if (response2.ok) {
      // 更新最后备份时间，让增量备份能正确计算新数据
      localStorage.setItem(LAST_BACKUP_TIME_KEY, new Date().toISOString())
      return { success: true, message: `完整备份成功: ${filename}` }
    }
    return { success: false, message: `备份失败: HTTP ${response2.status}` }
  } catch (e) {
    return { success: false, message: `备份失败: ${e instanceof Error ? e.message : String(e)}` }
  }
}

async function downloadExistingBackup(config: WebDAVConfig): Promise<BackupData | null> {
  try {
    const response = await fetch(getBackupUrl(config), {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(config),
      },
    })

    if (!response.ok) return null

    const json = await response.text()
    return JSON.parse(json) as BackupData
  } catch {
    return null
  }
}

export async function listWebDAVBackups(config: WebDAVConfig): Promise<{ success: boolean; files: { name: string; url: string; date: string; size: number }[]; message: string }> {
  try {
    const response = await fetch(config.url, {
      method: 'PROPFIND',
      headers: {
        Authorization: getAuthHeader(config),
        'Content-Type': 'application/xml',
        Depth: '1',
      },
    })

    if (!response.ok && response.status !== 207) {
      return { success: false, files: [], message: `列出文件失败: HTTP ${response.status}` }
    }

    const text = await response.text()
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, 'text/xml')

    // Parse WebDAV response for all files
    const responses = xmlDoc.querySelectorAll('response, d\\:response, D\\:response')
    const files: { name: string; url: string; date: string; size: number }[] = []
    const baseUrl = config.url.endsWith('/') ? config.url : config.url + '/'

    responses.forEach((resp) => {
      const hrefEl = resp.querySelector('href, d\\:href, D\\:href')
      const propstat = resp.querySelector('propstat, d\\:propstat, D\\:propstat')
      if (!hrefEl || !propstat) return

      const status = propstat.querySelector('status, d\\:status, D\\:status')
      if (status && status.textContent?.includes('404')) return

      const url = hrefEl.textContent || ''
      if (!url.includes('qwerty-learner-backup-') || !url.endsWith('.json')) return

      // Extract timestamp from filename
      const match = url.match(/qwerty-learner-backup-(\d+)\.json/)
      const timestamp = match ? parseInt(match[1]) : Date.now()
      const date = new Date(timestamp).toLocaleString()

      // Extract file size
      const sizeEl = resp.querySelector('getcontentlength, d\\:getcontentlength, D\\:getcontentlength')
      const size = sizeEl ? parseInt(sizeEl.textContent || '0') : 0

      const fullUrl = url.startsWith('http') ? url : new URL(url, baseUrl).href
      files.push({ name: url.split('/').pop() || url, url: fullUrl, date, size })
    })

    // Sort by date descending
    files.sort((a, b) => {
      const aTime = a.name.match(/-(\d+)\.json/)?.[1] || '0'
      const bTime = b.name.match(/-(\d+)\.json/)?.[1] || '0'
      return parseInt(bTime) - parseInt(aTime)
    })

    return { success: true, files, message: `找到 ${files.length} 个备份文件` }
  } catch (e) {
    return { success: false, files: [], message: `列出文件失败: ${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function restoreFromWebDAV(config: WebDAVConfig, fileUrl?: string): Promise<{ success: boolean; data?: BackupData['data']; message: string }> {
  try {
    const url = fileUrl || getBackupUrl(config)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(config),
      },
    })

    if (!response.ok) {
      return { success: false, message: `下载失败: HTTP ${response.status}` }
    }

    const json = await response.text()
    const backupData: BackupData = JSON.parse(json)
    return { success: true, data: backupData.data, message: '恢复成功' }
  } catch (e) {
    return { success: false, message: `恢复失败: ${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function deleteWebDAVBackup(config: WebDAVConfig, fileUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(fileUrl, {
      method: 'DELETE',
      headers: {
        Authorization: getAuthHeader(config),
      },
    })

    if (response.ok || response.status === 204) {
      return { success: true, message: '删除成功' }
    }
    return { success: false, message: `删除失败: HTTP ${response.status}` }
  } catch (e) {
    return { success: false, message: `删除失败: ${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function getBackupInfo(config: WebDAVConfig): Promise<{ success: boolean; info?: { backupTime: string; recordCount: number }; message: string }> {
  try {
    const response = await fetch(getBackupUrl(config), {
      method: 'GET',
      headers: {
        Authorization: getAuthHeader(config),
      },
    })

    if (!response.ok) {
      return { success: false, message: '暂无备份文件' }
    }

    const json = await response.text()
    const backupData: BackupData = JSON.parse(json)
    const recordCount =
      backupData.data.wordRecords.length +
      backupData.data.chapterRecords.length +
      backupData.data.reviewRecords.length

    return {
      success: true,
      info: {
        backupTime: backupData.backupTime,
        recordCount,
      },
      message: `上次备份: ${backupData.backupTime}，共 ${recordCount} 条记录`,
    }
  } catch (e) {
    return { success: false, message: `获取备份信息失败: ${e instanceof Error ? e.message : String(e)}` }
  }
}

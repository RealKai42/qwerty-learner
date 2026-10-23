import { Button } from '@/components/ui/button'
import type { MemoSettings } from '@/typings/memo'
import { memoSettingsRequest } from '@/utils/memo'
import { backendEnabled } from '@/utils/runtime-config'
import { useEffect, useState } from 'react'

export default function MemoSetting() {
  const [settings, setSettings] = useState<MemoSettings | null>(null)
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    memoSettingsRequest()
      .then((data) => {
        if (active) setSettings(data)
      })
      .catch((error) => {
        if (active) setError(error instanceof Error ? error.message : '读取设置失败。')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const save = async (clear = false) => {
    if (saving) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const result = await memoSettingsRequest(clear ? 'DELETE' : 'POST', clear ? undefined : token)
      setSettings(result)
      setToken('')
      setMessage(clear ? '已清除 Token，墨墨导入已停用。' : 'Token 已保存，立即生效。')
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存设置失败。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="flex w-full flex-col gap-5 overflow-y-auto p-7 text-left text-sm text-gray-700 dark:text-gray-200"
      onKeyDown={(event) => {
        if (event.key !== 'Escape') event.stopPropagation()
      }}
    >
      <h3 className="text-xl font-medium">墨墨设置</h3>
      <p role="status">
        {loading
          ? '正在读取墨墨配置…'
          : message || (settings ? (settings.configured ? '已配置墨墨 Token' : '尚未配置墨墨 Token') : '未能读取墨墨配置')}
      </p>
      {settings?.source === 'environment' && (
        <p className="text-xs text-gray-500">当前使用服务端环境变量配置，保存新 Token 后会优先使用新配置。</p>
      )}
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
      >
        <label htmlFor="memo-token" className="font-medium">
          墨墨 Token
        </label>
        <input
          id="memo-token"
          name="memo-token"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder={settings?.configured ? '已配置；输入新 Token 可替换' : '粘贴墨墨开放 API Token'}
          disabled={saving}
          maxLength={4096}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900"
        />
        <p className="text-xs leading-relaxed text-gray-500">
          在墨墨 App 的开放 API 页面获取 Token。
          {backendEnabled ? '配置保存在当前个人服务，刷新后仍然有效；' : 'Token 仅保存在当前浏览器，刷新后仍然有效；'}
          学习数据备份不包含 Token。
        </p>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading || saving || !token.trim()}>
            {saving ? '正在保存…' : '保存 Token'}
          </Button>
          <Button type="button" variant="outline" disabled={loading || saving || !settings?.configured} onClick={() => void save(true)}>
            清除配置
          </Button>
        </div>
      </form>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}
      <p className="text-xs text-gray-500">学习日从北京时间每天 04:00 开始，导入时会将旧词书合并去重到往日词汇。</p>
    </div>
  )
}

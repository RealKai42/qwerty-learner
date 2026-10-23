import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import { customDictionariesAtom, dictionariesAtom, dictionaryMetadata } from '@/store/dictionaries'
import type { PersonalDictionary } from '@/typings/personal'
import type { ImportContentType } from '@/utils/personal-dictionary'
import { parsePracticeImport, savePersonalDictionary } from '@/utils/personal-dictionary'
import { contentTypeLabels, normalizePracticeText } from '@/utils/practice'
import { useAtomValue, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PracticeImport({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [name, setName] = useState('我的短语与句子')
  const [target, setTarget] = useState('')
  const [contentType, setContentType] = useState<ImportContentType>('auto')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<PersonalDictionary | null>(null)
  const dictionaries = useAtomValue(dictionariesAtom).filter((dictionary) => dictionary.source === 'custom')
  const preview = useMemo(() => parsePracticeImport(text, contentType), [text, contentType])
  const setDictionaries = useSetAtom(customDictionariesAtom)
  const setCurrentId = useSetAtom(currentDictIdAtom)
  const currentId = useAtomValue(currentDictIdAtom)
  const setChapter = useSetAtom(currentChapterAtom)
  const setReview = useSetAtom(reviewModeInfoAtom)
  const navigate = useNavigate()
  const changeOpen = (value: boolean) => {
    if (saving) return
    setOpen(value)
    onOpenChange(value)
    if (value) {
      setSaved(null)
      setError('')
    }
  }
  const save = async () => {
    if (saving || preview.issues.length) return
    setSaving(true)
    setError('')
    try {
      const dictionary = await savePersonalDictionary(name, preview.items, target || undefined)
      setDictionaries((previous) => [dictionaryMetadata(dictionary), ...previous.filter((item) => item.id !== dictionary.id)])
      if (currentId === dictionary.id) {
        setChapter(0)
        setReview((previous) => ({ ...previous, isReviewMode: false, reviewRecord: undefined }))
      }
      setSaved(dictionary)
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存失败，请重试。')
    } finally {
      setSaving(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button>导入短语/句子</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>导入短语和句子</DialogTitle>
          <DialogDescription>每行一条英文，中文释义可用 Tab 分隔。支持 TXT、TSV 和 JSON，内容保存在当前浏览器。</DialogDescription>
        </DialogHeader>
        {saved ? (
          <div role="status" className="rounded-lg bg-indigo-50 p-4 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
            已保存到“{saved.name}”，共 {saved.length} 条。
          </div>
        ) : (
          <fieldset disabled={saving} className="flex flex-col gap-3 text-sm dark:text-gray-200">
            <label>
              保存到
              <select
                aria-label="保存到"
                className="ml-3 rounded border border-gray-300 dark:bg-gray-800"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              >
                <option value="">新建词书</option>
                {dictionaries.map((dictionary) => (
                  <option key={dictionary.id} value={dictionary.id}>
                    {dictionary.name}
                  </option>
                ))}
              </select>
            </label>
            {!target && (
              <label className="flex flex-col gap-1">
                词书名称
                <input
                  className="rounded border border-gray-300 dark:bg-gray-800"
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}
            <label>
              内容类型
              <select
                aria-label="内容类型"
                className="ml-3 rounded border border-gray-300 dark:bg-gray-800"
                value={contentType}
                onChange={(event) => setContentType(event.target.value as ImportContentType)}
              >
                <option value="auto">自动识别</option>
                <option value="phrase">短语</option>
                <option value="sentence">句子</option>
                <option value="word">单词</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              选择文件
              <input
                type="file"
                accept=".txt,.tsv,.json,text/plain,application/json"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  try {
                    setText(await file.text())
                    setError('')
                  } catch {
                    setError('文件读取失败，请重新选择。')
                  }
                  event.target.value = ''
                }}
              />
            </label>
            <label className="flex flex-col gap-1">
              英文内容
              <textarea
                aria-label="英文内容"
                className="h-36 rounded border border-gray-300 font-mono dark:bg-gray-800"
                value={text}
                spellCheck={false}
                onChange={(event) => setText(event.target.value)}
                placeholder={"take care of\t照顾\nDon't give up.\t不要放弃。"}
              />
            </label>
            <p role="status">
              可导入 {preview.items.length} 条，合并 {preview.duplicates} 条重复内容。
            </p>
            {preview.issues.length > 0 && (
              <div role="alert" className="text-red-600">
                {preview.issues.slice(0, 5).map((issue) => (
                  <p key={issue}>{issue}</p>
                ))}
              </div>
            )}
            {preview.items.length > 0 && (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded border p-3" aria-label="导入预览">
                {preview.items.slice(0, 8).map((item) => (
                  <div key={item.name} className="break-words">
                    <span className="mr-2 text-xs text-indigo-500">{contentTypeLabels[item.contentType ?? 'word']}</span>
                    {item.name}
                    {item.trans.length > 0 && <p className="text-gray-500">{item.trans.join('；')}</p>}
                    {normalizePracticeText(item.name) !== item.name && (
                      <p className="text-xs text-gray-500">练习文本：{normalizePracticeText(item.name)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">按整条文本合并重复项并保留释义。自定义词书会随学习数据备份，已有练习记录保留。</p>
          </fieldset>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <DialogFooter>
          {saved ? (
            <Button
              onClick={() => {
                setCurrentId(saved.id)
                setChapter(0)
                setReview((previous) => ({ ...previous, isReviewMode: false, reviewRecord: undefined }))
                changeOpen(false)
                navigate('/')
              }}
            >
              开始练习
            </Button>
          ) : (
            <Button
              disabled={saving || !preview.items.length || Boolean(preview.issues.length) || (!target && !name.trim())}
              onClick={() => void save()}
            >
              {saving ? '正在保存…' : `保存 ${preview.items.length} 条`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

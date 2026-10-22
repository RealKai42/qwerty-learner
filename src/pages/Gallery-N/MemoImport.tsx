import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import { customDictionariesAtom, dictionaryMetadata } from '@/store/dictionaries'
import type { CustomDictionary, MemoResponseType, MemoToday } from '@/typings/memo'
import { memoResponseOptions } from '@/typings/memo'
import { fetchMemoToday, memoResponseType, saveMemoDictionary } from '@/utils/memo'
import { useAtomValue, useSetAtom } from 'jotai'
import { Download, RefreshCw } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MemoImport({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [open, setOpen] = useState(false)
  const [snapshot, setSnapshot] = useState<MemoToday | null>(null)
  const [selected, setSelected] = useState<MemoResponseType[]>(memoResponseOptions.map((option) => option.value))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<CustomDictionary | null>(null)
  const generation = useRef(0)
  const setCustomDictionaries = useSetAtom(customDictionariesAtom)
  const setCurrentDictId = useSetAtom(currentDictIdAtom)
  const currentDictId = useAtomValue(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)
  const setReviewMode = useSetAtom(reviewModeInfoAtom)
  const navigate = useNavigate()

  const selectedItems = useMemo(
    () => snapshot?.items.filter((item) => selected.includes(memoResponseType(item.response))) ?? [],
    [selected, snapshot],
  )
  const missingDefinitions = selectedItems.filter((item) => !item.word.trans.length).length

  const readToday = async () => {
    const requestGeneration = ++generation.current
    setLoading(true)
    setError('')
    setSnapshot(null)
    setSaved(null)
    try {
      const data = await fetchMemoToday()
      if (generation.current === requestGeneration) setSnapshot(data)
    } catch (error) {
      if (generation.current === requestGeneration) setError(error instanceof Error ? error.message : '读取失败，请重试。')
    } finally {
      if (generation.current === requestGeneration) setLoading(false)
    }
  }

  const handleOpen = (value: boolean) => {
    if (saving) return
    setOpen(value)
    onOpenChange(value)
    if (value) {
      void readToday()
    } else {
      generation.current++
      setLoading(false)
    }
  }

  const importWords = async () => {
    if (!snapshot || saving) return
    setSaving(true)
    setError('')
    try {
      const dictionary = await saveMemoDictionary(snapshot, selected)
      const metadata = dictionaryMetadata(dictionary)
      setCustomDictionaries((previous) => [metadata, ...previous.filter((item) => item.id !== dictionary.id)])
      // A new filter can change chapter membership. Reset navigation, retain all practice records.
      if (currentDictId === dictionary.id) {
        setCurrentChapter(0)
        setReviewMode((previous) => ({ ...previous, isReviewMode: false, reviewRecord: undefined }))
      }
      setSaved(dictionary)
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存失败，请检查浏览器存储空间后重试。')
    } finally {
      setSaving(false)
    }
  }

  const startPractice = () => {
    if (!saved) return
    setCurrentDictId(saved.id)
    setCurrentChapter(0)
    setReviewMode((previous) => ({ ...previous, isReviewMode: false, reviewRecord: undefined }))
    setOpen(false)
    onOpenChange(false)
    navigate('/')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-indigo-500 text-white hover:bg-indigo-600">
          <Download className="h-4 w-4" />
          导入今日词汇
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>从墨墨导入今日词汇</DialogTitle>
          <DialogDescription>仅导入北京时间当天已完成学习的新词和复习词，每天保存一本个人词书。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
          {loading && <p role="status">正在读取墨墨今日学习记录…</p>}
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          {snapshot && !saved && (
            <>
              <p>
                {snapshot.date} · 已完成 {snapshot.completed} 词
              </p>
              <fieldset disabled={saving} className="space-y-3">
                <legend className="mb-2 font-medium">选择词汇类型（可多选）</legend>
                <p className="text-xs text-gray-500">按当天第一次反馈分类。</p>
                <div className="grid grid-cols-2 gap-3">
                  {memoResponseOptions.map((option) => {
                    const count = snapshot.items.filter((item) => memoResponseType(item.response) === option.value).length
                    if (option.value === 'OTHER' && !count) return null
                    return (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                      >
                        <input
                          type="checkbox"
                          className="rounded text-indigo-500 focus:ring-indigo-500"
                          checked={selected.includes(option.value)}
                          onChange={(event) =>
                            setSelected((previous) =>
                              event.target.checked ? [...previous, option.value] : previous.filter((value) => value !== option.value),
                            )
                          }
                        />
                        <span>{option.label}</span>
                        <span className="ml-auto text-gray-500">{count}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
              <p className="rounded-lg bg-indigo-50 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200" aria-live="polite">
                将导入 {selectedItems.length} 词，其中新词 {selectedItems.filter((item) => item.isNew).length} 个、复习词{' '}
                {selectedItems.filter((item) => !item.isNew).length} 个。
              </p>
              {snapshot.completed === 0 && <p>今天尚无已完成的词汇。请先在墨墨完成学习并同步后，再重新读取。</p>}
              {!selected.length && <p>请至少选择一种词汇类型。</p>}
              {missingDefinitions > 0 && (
                <p className="text-amber-700 dark:text-amber-300">{missingDefinitions} 个词暂无本地释义，将保留拼写供练习。</p>
              )}
              <p className="text-xs leading-relaxed text-gray-500">
                同一天再次导入会按当前选择更新词表，练习从第一章开始；已有单词练习记录保留。词书保存在当前浏览器，可随学习数据一起备份。
              </p>
            </>
          )}
          {saved && (
            <div role="status" className="space-y-2 rounded-lg bg-indigo-50 p-4 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
              <p className="font-medium">已保存 {saved.length} 词</p>
              <p>{saved.name}</p>
              <p>{saved.description}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {saved ? (
            <Button onClick={startPractice}>开始练习</Button>
          ) : (
            <>
              <Button variant="outline" disabled={loading || saving} onClick={() => void readToday()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                重新读取
              </Button>
              <Button
                disabled={!snapshot || loading || saving || !selectedItems.length || !selected.length}
                onClick={() => void importWords()}
              >
                {saving ? '正在保存…' : `导入 ${selectedItems.length} 词`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

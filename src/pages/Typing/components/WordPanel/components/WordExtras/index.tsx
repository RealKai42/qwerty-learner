import { currentDictIdAtom, fontSizeConfigAtom, wordDictationConfigAtom, wordExtrasConfigAtom } from '@/store'
import type { Word } from '@/typings'
import type { WordExtras as Extras } from '@/utils/wordExtras'
import { getLocalExtras, loadWordExtras, maskWord, posLabelZh } from '@/utils/wordExtras'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'

export type WordExtrasProps = {
  word: Word
  /** 下一个单词，提前加载，切换时不卡 / preload the next word */
  nextWord?: Word
  showTrans: boolean
}

function useWordExtras(word: Word | undefined, enabled: boolean): Extras | undefined {
  const dictId = useAtomValue(currentDictIdAtom)
  const { onlineLookup, pixabayKey } = useAtomValue(wordExtrasConfigAtom)
  const [extras, setExtras] = useState<Extras | undefined>(word && getLocalExtras(word))

  useEffect(() => {
    if (!word || !enabled) return
    let alive = true
    setExtras(getLocalExtras(word))
    loadWordExtras(word, { dictId, onlineLookup, pixabayKey }).then((e) => alive && setExtras(e))
    return () => {
      alive = false
    }
  }, [word, enabled, dictId, onlineLookup, pixabayKey])

  return extras
}

export default function WordExtras({ word, nextWord, showTrans }: WordExtrasProps) {
  const config = useAtomValue(wordExtrasConfigAtom)
  const dictation = useAtomValue(wordDictationConfigAtom)
  const fontSize = useAtomValue(fontSizeConfigAtom)
  const enabled = config.showImage || config.showPos || config.showChunks
  const extras = useWordExtras(word, enabled)
  useWordExtras(nextWord, enabled) // 预加载 / preload (result discarded, warms the cache)

  const [imgFailed, setImgFailed] = useState(false)
  useEffect(() => setImgFailed(false), [extras?.image])

  if (!enabled || !extras) return null

  const showImage = config.showImage && extras.image && !imgFailed
  const showChunks = config.showChunks && extras.chunks.length > 0
  const showPos = config.showPos && extras.pos.length > 0
  const smallFont = Math.max(14, Math.round(fontSize.translateFont * 0.7))

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4 pb-2">
      {showPos && (
        <div className="flex flex-wrap justify-center gap-2">
          {extras.pos.map((p) => (
            <span
              key={p}
              className="rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300"
              title={posLabelZh(p)}
            >
              {p}
              {posLabelZh(p) && <span className="ml-1 opacity-70">{posLabelZh(p)}</span>}
            </span>
          ))}
        </div>
      )}

      {(showImage || showChunks) && (
        <div className="flex w-full items-start justify-center gap-6">
          {showImage && (
            <img
              src={extras.image}
              alt={dictation.isOpen ? '' : word.name}
              loading="eager"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="h-36 w-48 shrink-0 select-none rounded-xl object-cover shadow-md ring-1 ring-black/5 dark:opacity-90"
              draggable={false}
            />
          )}
          {showChunks && (
            <ul className="flex min-w-0 flex-col gap-1.5 text-left">
              <li className="text-xs font-medium uppercase tracking-wider text-gray-400">语块 Chunks</li>
              {extras.chunks.map((c) => (
                <li key={c.en} className="font-sans leading-snug" style={{ fontSize: smallFont }}>
                  <span className="text-gray-700 dark:text-gray-200">{dictation.isOpen ? maskWord(c.en, word.name) : c.en}</span>
                  {c.zh && showTrans && <span className="ml-2 text-gray-400 dark:text-gray-500">{c.zh}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

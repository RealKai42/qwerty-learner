import Tooltip from '@/components/Tooltip'
import { SoundIcon } from '@/components/WordPronunciationIcon/SoundIcon'
import useMicrosoftSpeech from '@/hooks/useMicrosoftSpeech'
import {
  fontSizeConfigAtom,
  isTextSelectableAtom,
  pronunciationConfigAtom,
  wordDictationConfigAtom,
  wordPronunciationEndSignalAtom,
} from '@/store'
import type { Sentence as SentenceType } from '@/typings'
import { useAtomValue } from 'jotai'
import { Fragment, useCallback, useEffect, useMemo, useRef } from 'react'

export type SentenceProps = {
  sentence: SentenceType
  wordName?: string
  showTrans?: boolean
  autoPlay?: boolean
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isWordChar(ch: string | undefined) {
  return !!ch && /[A-Za-z0-9']/.test(ch)
}

type Segment = { text: string; matched: boolean }

function highlightSegments(text: string, target: string): Segment[] {
  if (!target.trim()) return [{ text, matched: false }]

  const pattern = new RegExp(escapeRegExp(target.trim()), 'gi')
  const segments: Segment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const start = match.index
    const end = start + match[0].length
    const before = text[start - 1]
    const after = text[end]

    if (isWordChar(before) || isWordChar(after)) continue

    if (start > lastIndex) segments.push({ text: text.slice(lastIndex, start), matched: false })
    segments.push({ text: match[0], matched: true })
    lastIndex = end
  }
  if (lastIndex < text.length) segments.push({ text: text.slice(lastIndex), matched: false })

  return segments.length > 0 ? segments : [{ text, matched: false }]
}

export default function Sentence({ sentence, wordName, showTrans = true, autoPlay = false }: SentenceProps) {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  const isTextSelectable = useAtomValue(isTextSelectableAtom)
  const wordEndSignal = useAtomValue(wordPronunciationEndSignalAtom)
  const wordDictationConfig = useAtomValue(wordDictationConfigAtom)

  const speechLang = pronunciationConfig.type === 'uk' ? 'en-GB' : 'en-US'
  const speechOptions = useMemo(
    () => ({ lang: speechLang, volume: pronunciationConfig.volume, rate: pronunciationConfig.rate }),
    [speechLang, pronunciationConfig.volume, pronunciationConfig.rate],
  )
  const { speak, speaking, isSupported } = useMicrosoftSpeech(sentence.english, speechOptions)

  const handleClickSoundIcon = useCallback(() => {
    speak(true)
  }, [speak])

  const speakRef = useRef(speak)
  useEffect(() => {
    speakRef.current = speak
  }, [speak])

  const initialSignalRef = useRef(wordEndSignal)
  useEffect(() => {
    if (!autoPlay || !isSupported) {
      // Do not replay a pronunciation that ended while the sentence was hidden.
      initialSignalRef.current = wordEndSignal
      return
    }
    if (wordEndSignal === initialSignalRef.current) return
    initialSignalRef.current = wordEndSignal
    const timer = window.setTimeout(() => {
      speakRef.current(true)
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [wordEndSignal, autoPlay, isSupported])

  const sentenceFontSize = Math.max(14, Math.round(fontSizeConfig.translateFont * 0.85))
  const chineseFontSize = Math.max(12, Math.round(fontSizeConfig.translateFont * 0.75))

  const englishSegments = useMemo(
    () => (wordName ? highlightSegments(sentence.english, wordName) : [{ text: sentence.english, matched: false }]),
    [sentence.english, wordName],
  )

  return (
    <div className="mt-2 flex w-full max-w-4xl flex-col items-center gap-1 px-4">
      <div className="flex w-full items-center justify-center gap-2">
        <span
          className={`text-center italic text-gray-700 transition-colors duration-300 dark:text-white dark:text-opacity-70 ${
            isTextSelectable ? 'select-text' : ''
          }`}
          style={{ fontSize: `${sentenceFontSize}px` }}
        >
          {englishSegments.map((segment, idx) => (
            <Fragment key={idx}>
              {segment.matched ? (
                wordDictationConfig.isOpen ? (
                  <span className="mx-0.5 inline-block rounded bg-gray-200 px-1 font-semibold not-italic tracking-widest text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    {'_'.repeat(segment.text.length)}
                  </span>
                ) : (
                  <span className="font-semibold not-italic text-indigo-500 underline decoration-indigo-300 decoration-2 underline-offset-4 dark:text-indigo-300 dark:decoration-indigo-500">
                    {segment.text}
                  </span>
                )
              ) : (
                segment.text
              )}
            </Fragment>
          ))}
        </span>
        {isSupported && (
          <Tooltip content="朗读例句（浏览器语音）" className="h-5 w-5 shrink-0 cursor-pointer leading-none">
            <SoundIcon animated={speaking} onClick={handleClickSoundIcon} className="h-5 w-5" />
          </Tooltip>
        )}
      </div>
      {showTrans && sentence.chinese && (
        <span
          className={`text-center text-gray-500 transition-colors duration-300 dark:text-white dark:text-opacity-50 ${
            isTextSelectable ? 'select-text' : ''
          }`}
          style={{ fontSize: `${chineseFontSize}px` }}
        >
          {sentence.chinese}
        </span>
      )}
    </div>
  )
}

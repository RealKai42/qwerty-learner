import type { WordPronunciationIconRef } from '@/components/WordPronunciationIcon'
import { WordPronunciationIcon } from '@/components/WordPronunciationIcon'
import { SoundIcon } from '@/components/WordPronunciationIcon/SoundIcon'
import { useDefinitionSpeech } from '@/contexts/DefinitionSpeechContext'
import { currentDictInfoAtom, pronunciationConfigAtom } from '@/store'
import type { Word } from '@/typings'
import { useAtomValue } from 'jotai'
import type { MouseEvent } from 'react'
import { useCallback, useRef } from 'react'

export default function WordCard({ word, isActive, speechId }: { word: Word; isActive: boolean; speechId: string }) {
  const wordPronunciationIconRef = useRef<WordPronunciationIconRef>(null)
  const currentLanguage = useAtomValue(currentDictInfoAtom).language
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const { speak, speakingId } = useDefinitionSpeech()
  const translation = word.trans.join('；')

  const handlePlay = useCallback(() => {
    wordPronunciationIconRef.current?.play()
  }, [])

  const handlePlayTranslation = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      speak(translation, speechId)
    },
    [speak, speechId, translation],
  )

  const translationSpeechLabel =
    pronunciationConfig.transSpeechMode === 'cantonese' ? `用粤语朗读 ${word.name} 的中文释义` : `跟随系统朗读 ${word.name} 的中文释义`

  return (
    <div
      className={`mb-2 flex cursor-pointer select-text items-center rounded-xl p-4 shadow focus:outline-none ${
        isActive ? 'bg-indigo-50 dark:bg-indigo-800 dark:bg-opacity-20' : 'bg-white dark:bg-gray-700 dark:bg-opacity-20'
      }   `}
      key={word.name}
      onClick={handlePlay}
    >
      <div className="flex-1">
        <p className="select-all font-mono text-xl font-normal leading-6 dark:text-gray-50">
          {['romaji', 'hapin'].includes(currentLanguage) ? word.notation : word.name}
        </p>
        <div className="mt-2 max-w-sm font-sans text-sm text-gray-400">{translation}</div>
      </div>
      {pronunciationConfig.isTransRead && (
        <SoundIcon
          animated={speakingId === speechId}
          onClick={handlePlayTranslation}
          className="mr-2 h-8 w-8 text-indigo-500"
          iconClassName="h-5 w-5"
          ariaLabel={translationSpeechLabel}
        />
      )}
      <WordPronunciationIcon word={word} lang={currentLanguage} className="h-8 w-8" ref={wordPronunciationIconRef} />
    </div>
  )
}

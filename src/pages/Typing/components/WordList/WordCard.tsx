import type { WordPronunciationIconRef } from '@/components/WordPronunciationIcon'
import { WordPronunciationIcon } from '@/components/WordPronunciationIcon'
import { useFavorite } from '@/hooks/useFavorite'
import { currentChapterAtom, currentDictInfoAtom, isReviewModeAtom } from '@/store'
import type { Word } from '@/typings'
import { useAtomValue } from 'jotai'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import IconStar from '~icons/tabler/star'
import IconStarFilled from '~icons/tabler/star-filled'

export default function WordCard({ word, isActive }: { word: Word; isActive: boolean }) {
  const wordPronunciationIconRef = useRef<WordPronunciationIconRef>(null)
  const { t } = useTranslation()
  const dictInfo = useAtomValue(currentDictInfoAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)
  const { isFavorite, toggle } = useFavorite()
  const currentLanguage = dictInfo.language
  const isFav = isFavorite(word.name, dictInfo.id)

  const handlePlay = useCallback(() => {
    wordPronunciationIconRef.current?.play()
  }, [])

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      e.currentTarget.blur()
      void toggle(word.name, dictInfo.id, isReviewMode ? -1 : currentChapter)
    },
    [toggle, word.name, dictInfo.id, isReviewMode, currentChapter],
  )

  return (
    <div
      className={`mb-2 flex cursor-pointer select-text items-center rounded-xl p-4 shadow focus:outline-none ${
        isActive ? 'bg-indigo-50 dark:bg-indigo-800/20' : 'bg-white dark:bg-gray-700/20'
      }   `}
      key={word.name}
      onClick={handlePlay}
    >
      <div className="flex-1">
        <p className="select-all font-mono text-xl font-normal leading-6 dark:text-gray-50">
          {['romaji', 'hapin'].includes(currentLanguage) ? word.notation : word.name}
        </p>
        <div className="mt-2 max-w-sm font-sans text-sm text-gray-400">{word.trans.join('；')}</div>
      </div>
      <button
        type="button"
        onClick={handleToggleFavorite}
        className="mr-2 flex items-center justify-center rounded p-1 text-lg outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white"
        title={t('favorites.favoriteToggle')}
        aria-label={t('favorites.favoriteToggle')}
      >
        {isFav ? <IconStarFilled className="h-6 w-6 text-yellow-400" /> : <IconStar className="h-6 w-6 text-gray-400" />}
      </button>
      <WordPronunciationIcon word={word} lang={currentLanguage} className="h-8 w-8" ref={wordPronunciationIconRef} />
    </div>
  )
}

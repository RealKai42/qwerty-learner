import { useFavorite } from '@/hooks/useFavorite'
import usePronunciationSound from '@/hooks/usePronunciation'
import { currentChapterAtom, currentDictInfoAtom, isReviewModeAtom } from '@/store'
import type { WordWithIndex } from '@/typings'
import { flip, offset, shift, useFloating, useHover, useInteractions, useRole } from '@floating-ui/react'
import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconStar from '~icons/tabler/star'
import IconStarFilled from '~icons/tabler/star-filled'

export default function WordChip({ word }: { word: WordWithIndex }) {
  const { t } = useTranslation()
  const [showTranslation, setShowTranslation] = useState(false)
  const { x, y, strategy, refs, context } = useFloating({
    open: showTranslation,
    onOpenChange: setShowTranslation,
    middleware: [offset(4), shift(), flip()],
  })
  const hover = useHover(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role])
  const { play, stop } = usePronunciationSound(word.name, false)
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const isReviewMode = useAtomValue(isReviewModeAtom)
  const { isFavorite, toggle } = useFavorite()

  const onClickWord = useCallback(() => {
    stop()
    play()
  }, [play, stop])

  return (
    <div className="relative">
      <button
        ref={refs.setReference}
        className="word-chip select-all"
        {...getReferenceProps()}
        type="button"
        onClick={onClickWord}
        title={t('typing.result.readWord', { word: word.name })}
      >
        <span>{word.name}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.currentTarget.blur()
          void toggle(word.name, currentDictInfo.id, isReviewMode ? -1 : currentChapter)
        }}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white dark:bg-gray-600"
        title={t('favorites.favoriteToggle')}
        aria-label={t('favorites.favoriteToggle')}
      >
        {isFavorite(word.name, currentDictInfo.id) ? (
          <IconStarFilled className="h-4 w-4 text-yellow-400" />
        ) : (
          <IconStar className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {showTranslation && (
        <div
          ref={refs.setFloating}
          className="word-chip-tooltip"
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
          {...getFloatingProps()}
        >
          {word.trans}
        </div>
      )}
    </div>
  )
}

import { TypingStateActionType, useTypingContext } from '../../store'
import Tooltip from '@/components/Tooltip'
import { useFavorite } from '@/hooks/useFavorite'
import { currentDictInfoAtom, typingShortcutConfigAtom, wordDictationConfigAtom } from '@/store'
import { formatShortcut } from '@/utils/hotkeys'
import { useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import IconPrev from '~icons/tabler/arrow-narrow-left'
import IconNext from '~icons/tabler/arrow-narrow-right'
import IconStar from '~icons/tabler/star'
import IconStarFilled from '~icons/tabler/star-filled'

export default function PrevAndNextWord({ type, onToggleFavorite }: LastAndNextWordProps) {
  const { t } = useTranslation()
  const { state, dispatch } = useTypingContext()

  const wordDictationConfig = useAtomValue(wordDictationConfigAtom)
  const newIndex = useMemo(() => state.chapterData.index + (type === 'prev' ? -1 : 1), [state.chapterData.index, type])
  const word = state.chapterData.words[newIndex]
  const currentDictInfo = useAtomValue(currentDictInfoAtom)
  const currentLanguage = currentDictInfo.language
  const { isFavorite } = useFavorite()
  const typingShortcutConfig = useAtomValue(typingShortcutConfigAtom)
  const shortCutKey = useMemo(
    () => formatShortcut(type === 'prev' ? typingShortcutConfig.prevWord : typingShortcutConfig.nextWord),
    [type, typingShortcutConfig],
  )
  const favoriteShortcutKey = useMemo(
    () => formatShortcut(type === 'prev' ? typingShortcutConfig.favoritePrev : typingShortcutConfig.favoriteNext),
    [type, typingShortcutConfig],
  )
  const isFav = word ? isFavorite(word.name, currentDictInfo.id) : false

  const onClickWord = useCallback(() => {
    if (!word) return

    if (type === 'prev') dispatch({ type: TypingStateActionType.SKIP_2_WORD_INDEX, newIndex })
    if (type === 'next') dispatch({ type: TypingStateActionType.SKIP_2_WORD_INDEX, newIndex })
  }, [type, dispatch, newIndex, word])

  const headWord = useMemo(() => {
    if (!word) return ''

    const showWord = ['romaji', 'hapin'].includes(currentLanguage) ? word.notation : word.name

    if (type === 'prev') return showWord

    if (type === 'next') {
      return !wordDictationConfig.isOpen ? showWord : (showWord || '').replace(/./g, '_')
    }
  }, [word, currentLanguage, type, wordDictationConfig.isOpen])

  const favoriteTooltip = t('favorites.favoriteAdjacentTip', { key: favoriteShortcutKey })

  return (
    <>
      {word ? (
        <div className="flex items-center">
          {type === 'prev' && onToggleFavorite && (
            <Tooltip content={favoriteTooltip}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  e.currentTarget.blur()
                  onToggleFavorite(type)
                }}
                className="mr-2 flex shrink-0 grow-0 items-center justify-center rounded p-1 text-xl outline-none transition-colors duration-200 ease-in-out hover:text-yellow-400"
                aria-label={t('favorites.favoriteToggle')}
              >
                {isFav ? <IconStarFilled className="text-yellow-400" /> : <IconStar className="text-gray-400" />}
              </button>
            </Tooltip>
          )}
          <Tooltip content={t('typing.prevNextWord.shortcut', { key: shortCutKey })}>
            <div
              onClick={onClickWord}
              className="flex max-w-xs cursor-pointer select-none items-center text-gray-700 opacity-60 duration-200 ease-in-out hover:opacity-100 dark:text-gray-400"
            >
              {type === 'prev' && <IconPrev className="mr-4 shrink-0 grow-0 text-2xl" />}

              <div className={`grow-1 flex w-full flex-col ${type === 'next' ? 'items-end text-right' : ''}`}>
                <p
                  className={`font-mono text-2xl font-normal text-gray-700 dark:text-gray-400 ${
                    !wordDictationConfig.isOpen ? 'tracking-normal' : 'tracking-wider'
                  }`}
                >
                  {headWord}
                </p>
                {state.isTransVisible && (
                  <p className="line-clamp-1 max-w-full text-sm font-normal text-gray-600 dark:text-gray-500">{word.trans.join('；')}</p>
                )}
              </div>
              {type === 'next' && <IconNext className="ml-4 shrink-0 grow-0 text-2xl" />}
            </div>
          </Tooltip>
          {type === 'next' && onToggleFavorite && (
            <Tooltip content={favoriteTooltip}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  e.currentTarget.blur()
                  onToggleFavorite(type)
                }}
                className="ml-2 flex shrink-0 grow-0 items-center justify-center rounded p-1 text-xl outline-none transition-colors duration-200 ease-in-out hover:text-yellow-400"
                aria-label={t('favorites.favoriteToggle')}
              >
                {isFav ? <IconStarFilled className="text-yellow-400" /> : <IconStar className="text-gray-400" />}
              </button>
            </Tooltip>
          )}
        </div>
      ) : (
        <div />
      )}
    </>
  )
}

export type LastAndNextWordProps = {
  /** 上一个单词还是下一个单词 */
  type: 'prev' | 'next'
  /** 收藏相邻单词的回调 */
  onToggleFavorite?: (type: 'prev' | 'next') => void
}

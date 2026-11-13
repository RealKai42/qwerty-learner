import { LoadingWordUI } from '@/pages/ErrorBook/LoadingWordUI'
import useGetWord from '@/hooks/useGetWord'
import { WordPronunciationIcon } from '@/components/WordPronunciationIcon'
import { idDictionaryMap } from '@/resources/dictionary'
import { useFavorite } from '@/hooks/useFavorite'
import type { IFavoriteRecord } from '@/utils/db/record'
import { useTranslation } from 'react-i18next'
import IconStarFilled from '~icons/tabler/star-filled'

type FavoriteRowProps = {
  favorite: IFavoriteRecord
}

const FavoriteRow = ({ favorite }: FavoriteRowProps) => {
  const { t } = useTranslation()
  const dictInfo = idDictionaryMap[favorite.dict]
  const { word, isLoading, hasError } = useGetWord(favorite.word, dictInfo)
  const { toggle } = useFavorite()
  const displayWord = word && ['romaji', 'hapin'].includes(dictInfo?.language) ? word.notation : favorite.word

  return (
    <li className="flex w-full items-center justify-between rounded-lg bg-white px-6 py-3 text-black shadow-md dark:bg-gray-800 dark:text-white">
      <span className="min-w-0 basis-3/12 break-normal font-mono">{displayWord}</span>
      <span className="min-w-0 basis-6/12 break-normal">
        {word ? word.trans.join('；') : <LoadingWordUI isLoading={isLoading} hasError={hasError} />}
      </span>
      <span className="min-w-0 basis-2/12 break-normal truncate">{dictInfo?.name || favorite.dict}</span>
      <span className="flex basis-1/12 items-center justify-end gap-2">
        {dictInfo && word && (
          <WordPronunciationIcon word={word} lang={dictInfo.language} className="h-6 w-6" />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            e.currentTarget.blur()
            void toggle(favorite.word, favorite.dict, favorite.chapter)
          }}
          className="flex items-center justify-center rounded p-1 text-lg outline-none transition-colors duration-300 ease-in-out hover:bg-red-400 hover:text-white"
          title={t('favorites.unfavorite')}
          aria-label={t('favorites.unfavorite')}
        >
          <IconStarFilled className="h-6 w-6 text-yellow-400" />
        </button>
      </span>
    </li>
  )
}

export default FavoriteRow

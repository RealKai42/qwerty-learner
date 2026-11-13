import { recordFavoriteAction } from '@/utils'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import IconStar from '~icons/tabler/star'

const FavoriteBookButton = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const toFavorites = useCallback(() => {
    navigate('/favorites')
    recordFavoriteAction('open')
  }, [navigate])

  return (
    <button
      type="button"
      onClick={toFavorites}
      className={`flex items-center justify-center rounded p-[2px] text-lg text-indigo-500 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white`}
      title={t('typing.favoritesButton')}
    >
      <IconStar className="icon" />
    </button>
  )
}

export default FavoriteBookButton

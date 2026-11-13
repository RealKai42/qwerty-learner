import SharePicDialog from './SharePicDialog'
import { recordShareAction } from '@/utils'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconShare2 from '~icons/tabler/share-2'

export default function ShareButton() {
  const { t } = useTranslation()
  const [isShowSharePanel, setIsShowSharePanel] = useState(false)

  const randomChoose = useMemo(
    () => ({
      picRandom: Math.random(),
      promoteRandom: Math.random(),
    }),
    [],
  )

  const onClickShare = useCallback(() => {
    recordShareAction('open')
    setIsShowSharePanel(true)
  }, [])

  return (
    <>
      {isShowSharePanel && <SharePicDialog showState={isShowSharePanel} setShowState={setIsShowSharePanel} randomChoose={randomChoose} />}

      <button
        type="button"
        className="cursor-pointer text-xl text-gray-500 hover:text-indigo-400"
        onClick={onClickShare}
        title={t('typing.share.shareResult')}
      >
        <IconShare2 />
      </button>
    </>
  )
}

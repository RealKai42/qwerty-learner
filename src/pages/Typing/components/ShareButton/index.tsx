import { recordShareAction } from '@/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback, useMemo, useState } from 'react'
import SharePicDialog from './SharePicDialog'

export default function ShareButton() {
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
      <div onClick={onClickShare}>
        <FontAwesomeIcon icon={['fas', 'share-from-square']} className="text-xl text-indigo-400" size="lg" />
      </div>
    </>
  )
}

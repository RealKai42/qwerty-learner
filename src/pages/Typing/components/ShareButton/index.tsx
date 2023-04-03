import { recordShareAction } from '@/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback, useMemo, useState } from 'react'
import SharePicDialog from './SharePicDialog'
import { flip, offset, shift, useFloating, useHover, useInteractions, useRole } from '@floating-ui/react'

export default function ShareButton() {
  const [isShowSharePanel, setIsShowSharePanel] = useState(false)

  const [showTranslation, setShowTranslation] = useState(true)
  const { x, y, strategy, refs, context } = useFloating({
    open: showTranslation,
    onOpenChange: setShowTranslation,
    middleware: [offset(4), shift(), flip()],
    placement: 'top',
  })
  const hover = useHover(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role])

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

      <FontAwesomeIcon
        ref={refs.setReference}
        {...getReferenceProps()}
        icon={['fas', 'share-from-square']}
        className="cursor-pointer text-xl text-indigo-400"
        size="lg"
        onClick={onClickShare}
      />

      {showTranslation && (
        <div
          ref={refs.setFloating}
          className="tooltip z-10"
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
          {...getFloatingProps()}
        >
          ✨ 分享你的成绩给朋友
        </div>
      )}
    </>
  )
}

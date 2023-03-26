import type { IncorrectInfo } from './index'
import { flip, offset, shift, useFloating, useHover, useInteractions, useRole } from '@floating-ui/react'
import { useCallback, useState } from 'react'
import usePronunciationSound from '@/hooks/usePronunciation'

export type WordChipProps = {
  mistake: IncorrectInfo
}

export default function WordChip({ mistake: { word, translation } }: WordChipProps) {
  const [showTranslation, setShowTranslation] = useState(false)
  const { x, y, strategy, refs, context } = useFloating({
    open: showTranslation,
    onOpenChange: setShowTranslation,
    middleware: [offset(4), shift(), flip()],
  })
  const hover = useHover(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role])
  const { play, stop } = usePronunciationSound(word)

  const onClickWord = useCallback(() => {
    stop()
    play()
  }, [play, stop])

  return (
    <>
      <div ref={refs.setReference} className="word-chip select-none" {...getReferenceProps()} onClick={onClickWord}>
        <span>{word}</span>
      </div>
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
          {translation}
        </div>
      )}
    </>
  )
}

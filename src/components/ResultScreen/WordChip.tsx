import type { IncorrectInfo } from './index'
import { flip, offset, shift, useFloating, useHover, useInteractions, useRole } from '@floating-ui/react'
import { useState } from 'react'
import { useAtom } from 'jotai'
import { languageAtom } from '../../pages/Typing'

export type WordChipProps = {
  mistake: IncorrectInfo
}

export default function WordChip({ mistake: { word, translation } }: WordChipProps) {
  const [language] = useAtom(languageAtom)
  const [showTranslation, setShowTranslation] = useState(false)
  const { x, y, strategy, refs, context } = useFloating({
    open: showTranslation,
    onOpenChange: setShowTranslation,
    middleware: [offset(4), shift(), flip()],
  })
  const hover = useHover(context)
  const role = useRole(context, { role: 'tooltip' })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, role])
  //switch font based on language
  const getFontClassName = (language: string) => {
    switch (language) {
      case 'zh':
        return 'font-sansSC'
      case 'jp':
        return 'font-sansJP'
      case 'ko':
        return 'font-sansKR'
      default:
        return 'font-mono'
    }
  }
  return (
    <>
      {/* <div ref={refs.setReference} className="word-chip" {...getReferenceProps()}> */}
      {/* className contains word-chip and getFontClassName(language) */}
      <div ref={refs.setReference} className={`word-chip ${getFontClassName(language)}`} {...getReferenceProps()}>
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

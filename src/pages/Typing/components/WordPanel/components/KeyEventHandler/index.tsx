import type { WordUpdateAction } from '../InputHandler'
import { TypingContext } from '@/pages/Typing/store'
import { isImeText, isLegal } from '@/utils'
import { useCallback, useContext, useEffect } from 'react'

export default function KeyEventHandler({
  updateInput,
  onImeText,
}: {
  updateInput: (updateObj: WordUpdateAction) => void
  onImeText?: () => void
}) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      // Composition and auto-repeat are not committed letters.
      if (e.isComposing || e.keyCode === 229 || e.repeat) return

      const char = e.key

      if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        // Firefox uses these unmodified keys for find-as-you-type.
        if (char === "'" || char === '/') e.preventDefault()
        updateInput({ type: 'add', value: char, event: e })
      }
    },
    [updateInput],
  )

  useEffect(() => {
    if (!state.isTyping) return

    // A committed IME string often never arrives as a keydown.
    const onCompositionEnd = (event: CompositionEvent) => {
      if (isImeText(event.data)) onImeText?.()
    }

    window.addEventListener('keydown', onKeydown)
    window.addEventListener('compositionend', onCompositionEnd)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('compositionend', onCompositionEnd)
    }
  }, [onKeydown, onImeText, state.isTyping])

  return <></>
}

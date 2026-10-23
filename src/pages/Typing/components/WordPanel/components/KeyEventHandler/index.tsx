import type { WordUpdateAction } from '../InputHandler'
import { TypingContext } from '@/pages/Typing/store'
import { isChineseSymbol, isLegal } from '@/utils'
import { useCallback, useContext, useEffect } from 'react'

export default function KeyEventHandler({
  updateInput,
  allowDelete = false,
}: {
  updateInput: (updateObj: WordUpdateAction) => void
  allowDelete?: boolean
}) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      const char = e.key
      if (e.isComposing) return
      if (allowDelete && char === 'Backspace' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        updateInput({ type: 'delete', length: 1 })
        return
      }

      if (isChineseSymbol(char) && !(allowDelete && /[‘’“”]/.test(char))) {
        alert('您正在使用输入法，请关闭输入法。')
        return
      }

      if (char.length === 1 && isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        updateInput({ type: 'add', value: char, event: e })
      }
    },
    [updateInput, allowDelete],
  )

  useEffect(() => {
    if (!state.isTyping) return

    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [onKeydown, state.isTyping])

  return <></>
}

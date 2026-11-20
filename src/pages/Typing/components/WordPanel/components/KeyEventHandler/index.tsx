import type { WordUpdateAction } from '../InputHandler'
import { TypingContext } from '@/pages/Typing/store'
import { isChineseSymbol, isLegal } from '@/utils'
import { useCallback, useContext, useEffect } from 'react'

export default function KeyEventHandler({ updateInput }: { updateInput: (updateObj: WordUpdateAction) => void }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      // Composition and auto-repeat are not committed letters.
      if (e.isComposing || e.keyCode === 229 || e.repeat) return

      const char = e.key

      if (isChineseSymbol(char)) {
        alert('您正在使用输入法，请关闭输入法。')
        return
      }

      // 处理删除键
      if (char === 'Backspace') {
        updateInput({ type: 'delete', length: 1, event: e })
        return
      }

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

    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [onKeydown, state.isTyping])

  return <></>
}

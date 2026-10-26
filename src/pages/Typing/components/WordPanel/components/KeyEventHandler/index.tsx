import type { WordUpdateAction } from '../InputHandler'
import { TypingContext } from '@/pages/Typing/store'
import { isChineseSymbol, isLegal } from '@/utils'
import { useCallback, useContext, useEffect } from 'react'

export default function KeyEventHandler({ updateInput }: { updateInput: (updateObj: WordUpdateAction) => void }) {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      // IME composition (pinyin etc.) and long-press auto-repeat are not real
      // character input; counting them would mark every composing keystroke as
      // a wrong letter and pollute accuracy/WPM/SRS records.
      if (e.isComposing || e.keyCode === 229) return
      if (e.repeat) return

      const char = e.key

      if (isChineseSymbol(char)) {
        alert('您正在使用输入法，请关闭输入法。')
        return
      }

      if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        // isLegal already guarantees a single printable character; keep the
        // guard explicit so future changes cannot append a multi-char key.
        if (char.length !== 1) return
        e.preventDefault()
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

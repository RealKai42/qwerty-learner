import type { WordUpdateAction } from '../InputHandler'
import { TypingContext } from '@/pages/Typing/store'
import type { FormEvent } from 'react'
import { useCallback, useContext, useEffect, useRef } from 'react'

export default function TextAreaHandler({ updateInput }: { updateInput: (updateObj: WordUpdateAction) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!

  useEffect(() => {
    if (!textareaRef.current) return

    if (state.isTyping) {
      textareaRef.current.focus()
    } else {
      textareaRef.current.blur()
    }
  }, [state.isTyping])

  const onInput = (e: FormEvent<HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent
    if (!nativeEvent.isComposing && nativeEvent.data !== null) {
      updateInput({ type: 'add', value: nativeEvent.data, event: e })

      if (textareaRef.current) {
        textareaRef.current.value = ''
      }
    }
  }

  const onBlur = useCallback(() => {
    if (!textareaRef.current) return

    if (state.isTyping) {
      textareaRef.current.focus()
    }
  }, [state.isTyping])

  return (
    <textarea
      className="absolute left-0 top-0 m-0 h-0 w-0 appearance-none overflow-hidden border-0 p-0 focus:outline-none"
      ref={textareaRef}
      autoFocus
      spellCheck="false"
      onInput={onInput}
      onBlur={onBlur}
      onCompositionStart={() => {
        alert('您正在使用输入法，请关闭输入法。')
      }}
    ></textarea>
  )
}

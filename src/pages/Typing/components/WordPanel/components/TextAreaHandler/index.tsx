import type { WordUpdateAction } from '../InputHandler'
import { useTypingContext } from '@/pages/Typing/store'
import type { FormEvent } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function TextAreaHandler({ updateInput }: { updateInput: (updateObj: WordUpdateAction) => void }) {
  const { t } = useTranslation()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { state } = useTypingContext()

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
        alert(t('typing.inputMethodAlert'))
      }}
    ></textarea>
  )
}

import { TypingContext } from '@/pages/Typing/store'
import { FormEvent, KeyboardEvent, useCallback, useContext, useEffect, useRef } from 'react'

export type HiddenTextareaProps = {
  updateInput: (updateObj: WordUpdateObj) => void
}

export default function HiddenTextarea({ updateInput }: HiddenTextareaProps) {
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

  const onBlur = useCallback(() => {
    if (!textareaRef.current) return

    if (state.isTyping) {
      textareaRef.current.focus()
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

  return (
    <textarea
      className="absolute top-0 left-0 m-0 h-0 w-0 appearance-none overflow-hidden border-0 p-0 focus:outline-none"
      ref={textareaRef}
      autoFocus
      spellCheck="false"
      onBlur={onBlur}
      onInput={onInput}
      onCompositionStart={() => {
        alert('您正在使用中文输入法输入，请关闭输入法')
      }}
    ></textarea>
  )
}

export type WordUpdateObj = WordAddObj | WordDeleteObj | WordCompositionObj

export type WordAddObj = {
  type: 'add'
  value: string
  event: FormEvent<HTMLTextAreaElement>
}

export type WordDeleteObj = {
  type: 'delete'
  length: number
}

// composition api is not ready yet
export type WordCompositionObj = {
  type: 'composition'
  value: string
}

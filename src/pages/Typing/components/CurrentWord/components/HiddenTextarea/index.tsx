import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import { FormEvent, useCallback, useContext, useEffect, useRef } from 'react'

export type HiddenTextareaProps = {
  updateInput: (updateObj: WordUpdateAction) => void
}

export default function HiddenTextarea({ updateInput }: HiddenTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!

  useEffect(() => {
    if (!textareaRef.current) return

    if (state.isTyping) {
      textareaRef.current.focus()
    } else {
      textareaRef.current.blur()
    }
  }, [state.isTyping])

  const onBlur = useCallback(() => {
    dispatch({ type: TypingStateActionType.SET_IS_TYPING, payload: false })
  }, [dispatch])

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
      className="absolute left-0 top-0 m-0 h-0 w-0 appearance-none overflow-hidden border-0 p-0 focus:outline-none"
      ref={textareaRef}
      autoFocus
      spellCheck="false"
      onBlur={onBlur}
      onInput={onInput}
      onCompositionStart={() => {
        alert('您正在使用输入法，请关闭输入法。')
      }}
    ></textarea>
  )
}

export type WordUpdateAction = WordAddAction | WordDeleteAction | WordCompositionAction

export type WordAddAction = {
  type: 'add'
  value: string
  event: FormEvent<HTMLTextAreaElement>
}

export type WordDeleteAction = {
  type: 'delete'
  length: number
}

// composition api is not ready yet
export type WordCompositionAction = {
  type: 'composition'
  value: string
}

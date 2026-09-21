import type { WordUpdateAction } from '../InputHandler'
import { isChineseSymbol, isLegal } from '@/utils'
import { useCallback, useEffect } from 'react'

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

export default function KeyEventHandler({ updateInput }: { updateInput: (updateObj: WordUpdateAction) => void }) {
  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return

      const char = e.key

      if (isChineseSymbol(char)) {
        alert('您正在使用输入法，请关闭输入法。')
        return
      }

      if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        updateInput({ type: 'add', value: char, event: e })
      }
    },
    [updateInput],
  )

  // Listen unconditionally so the very first keystroke — which also flips
  // isTyping in the parent — still gets recorded as an input character.
  useEffect(() => {
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [onKeydown])

  return <></>
}

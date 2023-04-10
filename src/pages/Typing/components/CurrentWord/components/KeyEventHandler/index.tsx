import { isChineseSymbol, isLegal } from '@/utils'
import { useCallback, useEffect } from 'react'
import { WordUpdateAction } from '../InputHandler'

export default function KeyEventHandler({ updateInput }: { updateInput: (updateObj: WordUpdateAction) => void }) {
  const onKeydown = useCallback(
    (e: KeyboardEvent) => {
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

  useEffect(() => {
    window.addEventListener('keydown', onKeydown)
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  })

  return <></>
}

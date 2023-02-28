import { useEffect, useCallback } from 'react'
import { isLegal, isChineseSymbol } from '@/utils/utils'
import { useAtom } from 'jotai'
import { inputCountAtom } from '../..'
// DIH: Direct_input_handler
export type DIHProps = {
  isStart: boolean
  isFinish: boolean
  setInputWord: (value: string | ((prevValue: string) => string)) => void
  //setInputCount: Function
  playKeySound: () => void
}

const EXPLICIT_SPACE = '␣'

const DirectInputHandler: React.FC<DIHProps> = ({
  isStart,
  isFinish,
  setInputWord,
  playKeySound,
  //setInputCount
}) => {
  const onKeydown = useCallback(
    // 抽离时要改
    (e) => {
      const char = e.key
      if (char === ' ') {
        // 防止用户惯性按空格导致页面跳动
        e.preventDefault()
        setInputWord((value) => (value += EXPLICIT_SPACE))
        playKeySound()
      }
      if (isChineseSymbol(char)) {
        alert('您正在使用中文输入法输入，请关闭输入法')
      }
      if (isLegal(char) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        setInputWord((value) => (value += char))
        setInputCount((value: number) => value + 1)
        playKeySound()

        //wordStat.current.countInput += 1
      } else if (char === 'Backspace') setInputWord((value) => value.substr(0, value.length - 1))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playKeySound],
  )

  const [, setInputCount] = useAtom(inputCountAtom)

  useEffect(() => {
    if (isStart && !isFinish) {
      window.addEventListener('keydown', onKeydown)
    }
    return () => {
      window.removeEventListener('keydown', onKeydown)
    }
  }, [isStart, isFinish, onKeydown])

  return <></>
}

export default DirectInputHandler

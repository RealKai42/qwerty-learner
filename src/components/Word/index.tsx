import React, { useEffect, useState, useRef, useCallback } from 'react'
import Letter from '../Letter'
import { isLegal } from '../../utils/utils'

const Word: React.FC<WordProps> = ({ word = 'defaultWord', onFinish, isStart }) => {
  word = word.replaceAll(' ', '_')
  const [value, setValue] = useState('')
  let errorIndex = useRef(-1)
  let finishInput = useRef(false)

  // 每次渲染 重置 errorIndex、判断是否输入完毕
  errorIndex.current = -1
  finishInput.current = !(value.length < word.length)

  const onKeydown = useCallback((e) => {
    const char = e.key

    if (char === ' ') {
      // 防止用户惯性按空格导致页面跳动
      e.preventDefault()
    }

    if (isLegal(char)) {
      if (errorIndex.current === -1 && !finishInput.current) {
        setValue((value) => (value += char))
      } else if (errorIndex.current !== -1) {
        // 删除错误字母，添加新字母
        setValue((value) => {
          let t = value.slice(0, errorIndex.current)
          t += char
          return t
        })
      }
    } else if (char === 'Backspace') {
      setValue((value) => value.substr(0, value.length - 1))
    }
  }, [])

  useEffect(() => {
    if (isStart) {
      window.addEventListener('keydown', onKeydown)
    }

    return () => {
      if (isStart) {
        window.removeEventListener('keydown', onKeydown)
      }
    }
  }, [isStart, onKeydown])

  useEffect(() => {
    // 在 UI 渲染后，如果完成了输入，则通知父组件
    if (errorIndex.current === -1 && finishInput.current && onFinish) {
      onFinish()
    }
  })

  const getState = (index: number) => {
    const length = value.length
    if (index >= length || (errorIndex.current !== -1 && index > errorIndex.current)) {
      return 'normal'
    }

    if (word[index] !== value[index]) {
      errorIndex.current = index
      return 'error'
    } else {
      return 'correct'
    }
  }

  return (
    <div>
      {word.split('').map((t, index) => {
        return <Letter key={`${index}-${t}`} letter={t} state={getState(index)} />
      })}
    </div>
  )
}

export type WordProps = {
  word: string
  onFinish: Function
  isStart: boolean
}
export default Word

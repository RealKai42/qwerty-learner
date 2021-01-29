import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import styles from './App.module.css'
import Word from 'components/Word'
import Translation from 'components/Translation'
import Speed from 'components/Speed'
import { isLegal } from 'utils/utils'
import { useHotkeys } from 'react-hotkeys-hook'

import cet4Dict from 'assets/CET4_N.json'
import cet6Dict from 'assets/CET6_N.json'

function TypingPage() {
  const [order, setOrder] = useState(0)
  const [selectDict, setSelectDic] = useState('cet4')
  const [dict, setDict] = useState(cet4Dict)
  const [inputCount, setInputCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [isStart, setIsStart] = useState(false)

  useHotkeys('enter', () => {
    onChangeStart()
  })

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      const char = e.key

      if (isLegal(char)) {
        setInputCount((count) => count + 1)
      }
    }

    if (isStart) {
      window.addEventListener('keydown', onKeydown)
    }

    return () => {
      if (isStart) {
        window.removeEventListener('keydown', onKeydown)
      }
    }
  }, [isStart])

  const onFinish = () => {
    setOrder((order) => (order + 1 < dict.length ? order + 1 : order))
    setCorrectCount((count) => (count += dict[order].name.length))
  }

  const onChangeDict = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectDic(value)
    switch (value) {
      case 'cet4':
        setDict(cet4Dict)
        break
      case 'cet6':
        setDict(cet6Dict)
        break
      default:
        setDict(cet4Dict)
    }
  }

  const onChangeStart = useCallback(() => {
    setIsStart((isStart) => !isStart)
  }, [])

  return (
    <div className={styles.App}>
      <button onClick={onChangeStart}>{isStart ? '暂停' : '开始'}</button>
      <span>快捷键 Enter 开始</span>
      <div>
        <select value={selectDict} onChange={onChangeDict}>
          <option value="cet4">CET-4</option>
          <option value="cet6">CET-6</option>
        </select>
        <Speed correctCount={correctCount} inputCount={inputCount} isStart={isStart} />
      </div>
      <Word key={`word-${dict[order].name}`} word={dict[order].name} onFinish={onFinish} isStart={isStart} />
      <Translation key={`trans-${dict[order].name}`} trans={dict[order].trans[0]} />
    </div>
  )
}

TypingPage.propTypes = {}

export default TypingPage

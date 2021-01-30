import React, { useEffect, useState, useCallback, ChangeEvent } from 'react'
import Header from 'components/Header'
import Main from 'components/Main'
import Footer from 'components/Footer'
import Word from 'components/Word'
import Translation from 'components/Translation'
import Speed from 'components/Speed'
import { isLegal } from 'utils/utils'
import { useHotkeys } from 'react-hotkeys-hook'

import cet4Dict from 'assets/CET4_N.json'
import cet6Dict from 'assets/CET6_N.json'

const App: React.FC = () => {
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
    <div className="h-screen w-full pb-4 flex flex-col items-center">
      <Header>
        <div>
          <select value={selectDict} onChange={onChangeDict}>
            <option value="cet4">CET-4</option>
            <option value="cet6">CET-6</option>
          </select>
        </div>
        <div className="group relative">
          <button
            className={`${
              isStart ? 'bg-gray-300' : 'bg-indigo-400'
            }  text-white text-lg  w-20 px-6 py-1 rounded-lg focus:outline-none flex items-center justify-center`}
            onClick={onChangeStart}
          >
            {isStart ? 'Pause' : 'Start'}
          </button>
          <div className="invisible group-hover:visible absolute top-full left-1/2 w-40 -ml-20 pt-2 flex items-center justify-center">
            <span className="py-1 px-3 text-gray-500 text-xs">快捷键 Enter</span>
          </div>
        </div>
      </Header>
      <Main>
        <div className="container flex mx-auto flex-col items-center justify-center">
          <Word key={`word-${dict[order].name}`} word={dict[order].name} onFinish={onFinish} isStart={isStart} />
          <Translation key={`trans-${dict[order].name}`} trans={dict[order].trans[0]} />

          <Speed correctCount={correctCount} inputCount={inputCount} isStart={isStart} />
        </div>
      </Main>
      <Footer />
    </div>
  )
}

export default App

import { TypingContext, TypingStateActionType } from '../../store'
import PrevAndNextWord from '../PrevAndNextWord'
import Progress from '../Progress'
import Phonetic from './components/Phonetic'
import Translation from './components/Translation'
import { default as WordComponent } from './components/Word'
import { isShowPrevAndNextWordAtom, phoneticConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useState } from 'react'

const maskBg = {
  transparent: 'bg-[#faf9ffcc] dark:bg-gray-900 dark:opacity-90',
  opaque: 'bg-[#faf9ff] dark:bg-[#1f1f1f]',
}

export default function WordPanel() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const isShowPrevAndNextWord = useAtomValue(isShowPrevAndNextWordAtom)
  const [wordComponentKey, setWordComponentKey] = useState(0)

  const currentWord = state.chapterData.words[state.chapterData.index]

  const reloadCurrentWordComponent = useCallback(() => {
    setWordComponentKey((old) => old + 1)
  }, [])

  const onFinish = useCallback(() => {
    if (state.chapterData.index < state.chapterData.words.length - 1 || state.isLoopSingleWord) {
      // 用户完成当前单词
      if (state.isLoopSingleWord) {
        dispatch({ type: TypingStateActionType.LOOP_CURRENT_WORD })
        reloadCurrentWordComponent()
      } else {
        dispatch({ type: TypingStateActionType.NEXT_WORD })
      }
    } else {
      // 用户完成当前章节
      dispatch({ type: TypingStateActionType.FINISH_CHAPTER })
    }
  }, [state, dispatch, reloadCurrentWordComponent])

  return (
    <div className="container flex h-full w-full flex-col items-center justify-center">
      <div className="container flex h-24 w-full shrink-0 grow-0 justify-between px-12 pt-10">
        {isShowPrevAndNextWord && state.isTyping && (
          <>
            <PrevAndNextWord type="prev" />
            <PrevAndNextWord type="next" />
          </>
        )}
      </div>
      <div className="container flex flex-grow flex-col items-center justify-center">
        {currentWord && (
          <div className="relative flex w-full justify-center">
            {!state.isTyping && (
              <div
                className={`absolute left-0 top-0 z-10 flex h-full w-full items-center backdrop-blur-sm ${
                  state.timerData.time ? maskBg.transparent : maskBg.opaque
                }`}
              >
                <p className="w-full animate-pulse select-none text-center text-xl text-gray-600 dark:text-gray-50">
                  按任意键{state.timerData.time ? '继续' : '开始'}
                </p>
              </div>
            )}
            <div className="relative">
              <WordComponent word={currentWord.name} onFinish={onFinish} key={wordComponentKey} />
              {phoneticConfig.isOpen && <Phonetic word={currentWord} />}
              {state.isTransVisible && <Translation trans={currentWord.trans.join('；')} />}
            </div>
          </div>
        )}
      </div>
      <Progress className={`mb-10 mt-auto ${state.isTyping ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  )
}

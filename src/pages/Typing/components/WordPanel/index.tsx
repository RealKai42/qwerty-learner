import { TypingContext, TypingStateActionType } from '../../store'
import Phonetic from './components/Phonetic'
import Translation from './components/Translation'
import { default as WordComponent } from './components/Word'
import { phoneticConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useState } from 'react'

export default function WordPanel() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
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
    <div className="flex flex-col items-center">
      {currentWord && (
        <>
          <WordComponent word={currentWord.name} onFinish={onFinish} key={wordComponentKey} />
          {phoneticConfig.isOpen && <Phonetic word={currentWord} />}
          {state.isTransVisible && <Translation trans={currentWord.trans.join('；')} />}
        </>
      )}
    </div>
  )
}

import { TypingContext, TypingStateActionType } from '../../store'
import Phonetic from './components/Phonetic'
import Translation from './components/Translation'
import { default as WordComponent } from './components/Word'
import { phoneticConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useCallback, useContext, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import IconBackArrow from '~icons/material-symbols/arrow-back-ios-rounded'
import IconForwardArrow from '~icons/material-symbols/arrow-forward-ios-rounded'

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

  const onPreviousword = useCallback(() => {
    state.chapterData.index > 0 && dispatch({ type: TypingStateActionType.PREV_WORD })
  }, [dispatch, state.chapterData.index])

  const onNextword = useCallback(() => {
    state.chapterData.words?.length - 1 > state.chapterData.index && dispatch({ type: TypingStateActionType.NEXT_WORD })
  }, [dispatch, state.chapterData.index, state.chapterData.words?.length])

  useHotkeys(
    'ctrl + Alt + ArrowLeft',
    (e) => {
      e.preventDefault()
      onPreviousword()
    },
    { preventDefault: true },
  )

  useHotkeys(
    'ctrl + Alt + ArrowRight',
    (e) => {
      e.preventDefault()
      onNextword()
    },
    { preventDefault: true },
  )

  return (
    <div className="flex flex-col items-center">
      {
        <>
          <div className="flex items-center">
            <IconBackArrow
              onClick={onPreviousword}
              className={`pr-40 ${state.chapterData.index === 0 ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer'}`}
              fontSize={80}
              width={30}
              height={30}
            ></IconBackArrow>
            <div>
              <WordComponent word={currentWord.name} onFinish={onFinish} key={wordComponentKey} />
              {phoneticConfig.isOpen && <Phonetic word={currentWord} />}
              {state.isTransVisible && <Translation trans={currentWord.trans.join('；')} />}
            </div>
            <IconForwardArrow
              onClick={onNextword}
              className={`pl-40 ${
                state.chapterData.words?.length - 1 === state.chapterData.index ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer'
              }`}
              fontSize={80}
              width={30}
              height={30}
            ></IconForwardArrow>
          </div>
        </>
      }
    </div>
  )
}

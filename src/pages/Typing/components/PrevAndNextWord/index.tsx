import { TypingContext } from '../../store'
import { isShowPrevAndNextAtom } from '@/store'
import { useAtomValue } from 'jotai'
import { useContext } from 'react'
import IconPrev from '~icons/tabler/arrow-narrow-left'
import IconNext from '~icons/tabler/arrow-narrow-right'

export default function PrevAndNextWord({ type, className = '' }: LastAndNextWordProps) {
  const isShow = useAtomValue(isShowPrevAndNextAtom)

  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state, dispatch } = useContext(TypingContext)!

  const offset = type === 'prev' ? -1 : 1
  const word = state.chapterData.words[state.chapterData.index + offset]

  if (isShow && word && !state.isFinished && state.isTyping)
    return (
      <div
        className={
          className +
          ' max-w-2/5 flex cursor-pointer items-center text-gray-700 opacity-60 duration-200 ease-in-out hover:opacity-100 dark:text-gray-400'
        }
      >
        {type === 'prev' && <IconPrev className="mr-4 text-2xl" />}
        <div className={`flex flex-col ${type === 'next' ? 'items-end' : ''}`}>
          <p className="font-mono text-2xl font-normal text-gray-700 dark:text-gray-400">{word.name}</p>
          <p className="text-sm font-normal text-gray-600 dark:text-gray-500">{word.trans.join('；')}</p>
        </div>
        {type === 'next' && <IconNext className="ml-4 text-2xl" />}
      </div>
    )

  return <div />
}

export type LastAndNextWordProps = {
  /** 上还是下 */
  type: 'prev' | 'next'
  className?: string
}

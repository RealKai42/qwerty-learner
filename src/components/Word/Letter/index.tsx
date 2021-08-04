import React from 'react'

export type LetterState = 'normal' | 'correct' | 'wrong'

const EXPLICIT_SPACE = '␣'

const stateClassNameMap: Record<string, Record<LetterState, string>> = {
  true: {
    normal: 'text-gray-400',
    correct: 'text-green-400 dark:text-green-700',
    wrong: 'text-red-400 dark:text-red-600',
  },
  false: {
    normal: 'text-gray-600 dark:text-gray-50',
    correct: 'text-green-600 dark:text-green-400',
    wrong: 'text-red-600 dark:text-red-400',
  },
}

const Letter: React.FC<LetterProps> = ({ letter, state = 'normal', visible }) => (
  <span
    className={`m-0 p-0 text-5xl font-mono font-normal ${
      stateClassNameMap[((letter === EXPLICIT_SPACE) as unknown) as string][state]
    } pr-0.8 duration-0 dark:text-opacity-80`}
  >
    {visible ? letter : '_'}
  </span>
)

export default React.memo(Letter)

export type LetterProps = {
  letter: string
  state: LetterState
  visible: boolean
}

import { EXPLICIT_SPACE } from '@/constants'
import { fontSizeConfigAtom } from '@/store'
import { useAtomValue } from 'jotai'
import React from 'react'

export type LetterState = 'normal' | 'correct' | 'wrong'

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

export type LetterProps = {
  letter: string
  state?: LetterState
  visible?: boolean
}

const Letter: React.FC<LetterProps> = ({ letter, state = 'normal', visible = true }) => {
  const fontSizeConfig = useAtomValue(fontSizeConfigAtom)
  return (
    <span
      className={`m-0 p-0 font-mono font-normal ${
        stateClassNameMap[(letter === EXPLICIT_SPACE) as unknown as string][state]
      } pr-0.8 duration-0 dark:text-opacity-80`}
      style={{ fontSize: fontSizeConfig.foreignFont.toString() + 'px' }}
    >
      {visible ? letter : '_'}
    </span>
  )
}

export default React.memo(Letter)

import React from 'react'

export type LetterState = 'normal' | 'correct' | 'wrong'

const Letter: React.FC<LetterProps> = ({ letter, state, visible }) => {
  let stateClassName = ''

  const defaultClassName = 'text-gray-600 dark:text-white dark:text-opacity-80'
  switch (state) {
    case 'normal':
      stateClassName = defaultClassName
      break
    case 'correct':
      stateClassName = 'text-green-600 dark:text-green-400'
      break
    case 'wrong':
      stateClassName = 'text-red-600 dark:text-red-400'
      break
    default:
      stateClassName = defaultClassName
  }

  return (
    <span
      className={`m-0 p-0 text-5xl font-mono font-normal transition-colors duration-300 ${stateClassName}`}
      style={{ paddingRight: '0.2rem' }}
    >
      {visible ? letter : '_'}
    </span>
  )
}

export default React.memo(Letter)

export type LetterProps = {
  letter: string
  state: LetterState
  visible: boolean
}

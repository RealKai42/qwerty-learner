import React from 'react'

export type LetterState = 'normal' | 'correct' | 'wrong'

const Letter: React.FC<LetterProps> = ({ letter, state, visible }) => {
  let stateClassName = ''

  const defaultClassName = visible ? 'text-gray-600' : 'text-transparent'
  switch (state) {
    case 'normal':
      stateClassName = defaultClassName
      break
    case 'correct':
      stateClassName = 'text-green-600'
      break
    case 'wrong':
      stateClassName = 'text-red-600'
      break
    default:
      stateClassName = defaultClassName
  }

  return <span className={`m-0 p-0 text-5xl font-mono font-normal ${stateClassName}`}>{letter}</span>
}

export default Letter

export type LetterProps = {
  letter: string
  state: LetterState
  visible: boolean
}

import React from 'react'

export type LetterState = 'normal' | 'correct' | 'error'

const Letter: React.FC<LetterProps> = ({ letter, state }) => {
  let stateClassName = ''

  switch (state) {
    case 'normal':
      stateClassName = 'text-gray-600'
      break
    case 'correct':
      stateClassName = 'text-green-600'
      break
    case 'error':
      stateClassName = 'text-red-600'
      break
    default:
      stateClassName = 'text-indigo-600'
  }

  return <span className={`m-0 p-0 text-5xl font-mono font-normal ${stateClassName}`}>{letter}</span>
}

export default Letter

export type LetterProps = {
  letter: string
  state: LetterState
}

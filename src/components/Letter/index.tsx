import React from 'react'
import style from './index.module.css'

export type LetterState = 'normal' | 'correct' | 'error'

const Letter: React.FC<LetterProps> = ({ letter, state }) => {
  let stateClassName = ''

  switch (state) {
    case 'normal':
      stateClassName = style.normal
      break
    case 'correct':
      stateClassName = style.correct
      break
    case 'error':
      stateClassName = style.error
      break
    default:
      stateClassName = style.normal
  }

  return <span className={`${style.letter} ${stateClassName}`}>{letter}</span>
}

export default Letter

export type LetterProps = {
  letter: string
  state: LetterState
}

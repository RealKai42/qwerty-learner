import type { LetterMistakes } from '@/utils/db/record'

type TextState = {
  inputWord: string
  hasWrong: boolean
  hasMadeInputWrong: boolean
  isFinished: boolean
  correctCount: number
  wrongCount: number
  letterStates: ('normal' | 'correct' | 'wrong')[]
  letterTimeArray: number[]
  letterMistake: LetterMistakes
}

// One key produces one transition; callers report counters outside React state updaters.
export function applyTextKey<T extends TextState>(
  state: T,
  key: string,
  target: string,
  ignoreCase: boolean,
  now: number,
): {
  next: T
  outcome: 'correct' | 'wrong' | 'delete' | 'ignored'
} {
  if (state.isFinished) return { next: state, outcome: 'ignored' }
  if (key === 'Backspace') {
    if (!state.inputWord.length) return { next: state, outcome: 'ignored' }
    const index = state.inputWord.length - 1
    const letterStates = [...state.letterStates]
    letterStates[index] = 'normal'
    return { next: { ...state, inputWord: state.inputWord.slice(0, -1), hasWrong: false, letterStates }, outcome: 'delete' }
  }
  if (state.hasWrong || state.inputWord.length >= target.length) return { next: state, outcome: 'ignored' }
  const index = state.inputWord.length
  const expected = target[index]
  const correct = ignoreCase ? key.toLowerCase() === expected.toLowerCase() : key === expected
  const letterStates = [...state.letterStates]
  letterStates[index] = correct ? 'correct' : 'wrong'
  const next: T = { ...state, inputWord: state.inputWord + key, letterStates, hasWrong: !correct }
  if (correct) {
    next.correctCount += 1
    next.letterTimeArray = [...state.letterTimeArray, now]
    next.isFinished = next.inputWord.length === target.length
  } else {
    next.hasMadeInputWrong = true
    next.wrongCount += 1
    next.letterMistake = { ...state.letterMistake, [index]: [...(state.letterMistake[index] ?? []), key] }
  }
  return { next, outcome: correct ? 'correct' : 'wrong' }
}

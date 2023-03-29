import { Word } from '@/typings'
import { createContext } from 'react'

export type ChapterData = {
  words: Word[]
  index: number
  correctCount: number
  wrongCount: number
  wrongWordIndexes: number[]
}
export type TimerData = {
  startTime: Date
  time: number
  accuracy: number
  wpm: number
}

export type TypingState = {
  chapterData: ChapterData
  timerData: TimerData
  isTyping: boolean
  isFinished: boolean
  isShowSkip: boolean
  isWordVisible: boolean
}

export const initialState: TypingState = {
  chapterData: {
    words: [],
    index: 0,
    correctCount: 0,
    wrongCount: 0,
    wrongWordIndexes: [],
  },
  timerData: {
    startTime: new Date(),
    time: 0,
    accuracy: 0,
    wpm: 0,
  },
  isTyping: false,
  isFinished: false,
  isShowSkip: false,
  isWordVisible: true,
}

export enum TypingStateActionType {
  SETUP_CHAPTER = 'SETUP_CHAPTER',
  SET_IS_SKIP = 'SET_IS_SKIP',
  SET_IS_TYPING = 'SET_IS_TYPING',
  TOGGLE_IS_TYPING = 'TOGGLE_IS_TYPING',
  REPORT_WRONG_WORD = 'REPORT_WRONG_WORD',
  NEXT_WORD = 'NEXT_WORD',
  FINISH_CHAPTER = 'FINISH_CHAPTER',
  INCREASE_CORRECT_COUNT = 'INCREASE_CORRECT_COUNT',
  INCREASE_WRONG_COUNT = 'INCREASE_WRONG_COUNT',
  SKIP_WORD = 'SKIP_WORD',
  REPEAT_CHAPTER = 'REPEAT_CHAPTER',
  DICTATION_CHAPTER = 'DICTATION_CHAPTER',
  NEXT_CHAPTER = 'NEXT_CHAPTER',
  TOGGLE_WORD_VISIBLE = 'TOGGLE_WORD_VISIBLE',
  TICK_TIMER = 'TICK_TIMER',
}

export type TypingStateAction =
  | { type: TypingStateActionType.SETUP_CHAPTER; payload: Word[] }
  | { type: TypingStateActionType.SET_IS_SKIP; payload: boolean }
  | { type: TypingStateActionType.SET_IS_TYPING; payload: boolean }
  | { type: TypingStateActionType.TOGGLE_IS_TYPING }
  | { type: TypingStateActionType.REPORT_WRONG_WORD }
  | { type: TypingStateActionType.NEXT_WORD }
  | { type: TypingStateActionType.FINISH_CHAPTER }
  | { type: TypingStateActionType.INCREASE_CORRECT_COUNT }
  | { type: TypingStateActionType.INCREASE_WRONG_COUNT }
  | { type: TypingStateActionType.SKIP_WORD }
  | { type: TypingStateActionType.REPEAT_CHAPTER }
  | { type: TypingStateActionType.DICTATION_CHAPTER }
  | { type: TypingStateActionType.NEXT_CHAPTER }
  | { type: TypingStateActionType.TOGGLE_WORD_VISIBLE }
  | { type: TypingStateActionType.TICK_TIMER }

type Dispatch = (action: TypingStateAction) => void

export const typingReducer = (state: TypingState, action: TypingStateAction): TypingState => {
  switch (action.type) {
    case TypingStateActionType.SETUP_CHAPTER:
      return {
        ...state,
        chapterData: {
          ...state.chapterData,
          words: action.payload,
        },
      }
    case TypingStateActionType.SET_IS_SKIP:
      return {
        ...state,
        isShowSkip: action.payload,
      }
    case TypingStateActionType.SET_IS_TYPING:
      return {
        ...state,
        isTyping: action.payload,
      }
    case TypingStateActionType.TOGGLE_IS_TYPING:
      return {
        ...state,
        isTyping: !state.isTyping,
      }
    case TypingStateActionType.REPORT_WRONG_WORD: {
      const prevIndex = state.chapterData.wrongWordIndexes.indexOf(state.chapterData.index)
      if (prevIndex === -1) {
        return {
          ...state,
          chapterData: {
            ...state.chapterData,
            wrongWordIndexes: [...state.chapterData.wrongWordIndexes, state.chapterData.index],
          },
        }
      } else {
        return state
      }
    }
    case TypingStateActionType.NEXT_WORD:
      return {
        ...state,
        chapterData: {
          ...state.chapterData,
          index: state.chapterData.index + 1,
        },
        isShowSkip: false,
      }
    case TypingStateActionType.FINISH_CHAPTER:
      return {
        ...state,
        isTyping: false,
        isFinished: true,
      }
    case TypingStateActionType.INCREASE_CORRECT_COUNT:
      return {
        ...state,
        chapterData: {
          ...state.chapterData,
          correctCount: state.chapterData.correctCount + 1,
        },
      }
    case TypingStateActionType.INCREASE_WRONG_COUNT:
      return {
        ...state,
        chapterData: {
          ...state.chapterData,
          wrongCount: state.chapterData.wrongCount + 1,
        },
      }

    case TypingStateActionType.SKIP_WORD: {
      const newIndex = state.chapterData.index + 1
      if (newIndex >= state.chapterData.words.length) {
        return {
          ...state,
          isTyping: false,
          isFinished: true,
        }
      } else {
        return {
          ...state,
          chapterData: {
            ...state.chapterData,
            index: newIndex,
          },
        }
      }
    }
    case TypingStateActionType.REPEAT_CHAPTER:
      return {
        ...initialState,
        chapterData: {
          ...initialState.chapterData,
          words: state.chapterData.words,
        },
        isTyping: true,
      }

    case TypingStateActionType.DICTATION_CHAPTER:
      return {
        ...initialState,
        chapterData: {
          ...initialState.chapterData,
          words: state.chapterData.words,
        },
        isTyping: true,
        isWordVisible: false,
      }
    case TypingStateActionType.NEXT_CHAPTER:
      return {
        ...initialState,
        isTyping: true,
      }
    case TypingStateActionType.TOGGLE_WORD_VISIBLE:
      return {
        ...state,
        isWordVisible: !state.isWordVisible,
      }
    case TypingStateActionType.TICK_TIMER: {
      let newTime = Math.floor((Date.now() - state.timerData.startTime.getTime()) / 1000)
      newTime = newTime === 0 ? 1 : newTime
      const inputSum =
        state.chapterData.correctCount + state.chapterData.wrongCount === 0
          ? 1
          : state.chapterData.correctCount + state.chapterData.wrongCount
      const accuracy = Math.round((state.chapterData.correctCount / inputSum) * 100)
      const wordNumber = state.isFinished ? state.chapterData.words.length : state.chapterData.index
      const wpm = Math.round((wordNumber / newTime) * 60)

      return {
        ...state,
        timerData: {
          ...state.timerData,
          time: newTime,
          accuracy,
          wpm,
        },
      }
    }
    default: {
      return state
    }
  }
}

export const TypingContext = createContext<{ state: TypingState; dispatch: Dispatch } | null>(null)

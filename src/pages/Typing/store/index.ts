import { WordWithIndex } from '@/typings'
import shuffle from '@/utils/shuffle'
import { createContext } from 'react'

export type ChapterData = {
  words: WordWithIndex[]
  index: number
  // 用户输入的单词数
  wordCount: number
  correctCount: number
  wrongCount: number
  wrongWordIndexes: number[]
  // 一次打对未犯错的单词索引
  correctWordIndexes: number[]
  // 本章节用户输入的单词的 record id 列表
  wordRecordIds: number[]
}
export type TimerData = {
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
  isTransVisible: boolean
  isLoopSingleWord: boolean
  // 是否正在保存数据
  isSavingRecord: boolean
}

export const initialState: TypingState = {
  chapterData: {
    words: [],
    index: 0,
    wordCount: 0,
    correctCount: 0,
    wrongCount: 0,
    wrongWordIndexes: [],
    correctWordIndexes: [],
    wordRecordIds: [],
  },
  timerData: {
    time: 0,
    accuracy: 0,
    wpm: 0,
  },
  isTyping: false,
  isFinished: false,
  isShowSkip: false,
  isWordVisible: true,
  isTransVisible: true,
  isLoopSingleWord: false,
  isSavingRecord: false,
}

export enum TypingStateActionType {
  SETUP_CHAPTER = 'SETUP_CHAPTER',
  SET_IS_SKIP = 'SET_IS_SKIP',
  SET_IS_TYPING = 'SET_IS_TYPING',
  TOGGLE_IS_TYPING = 'TOGGLE_IS_TYPING',
  REPORT_WRONG_WORD = 'REPORT_WRONG_WORD',
  REPORT_CORRECT_WORD = 'REPORT_CORRECT_WORD',
  NEXT_WORD = 'NEXT_WORD',
  LOOP_CURRENT_WORD = 'LOOP_CURRENT_WORD',
  FINISH_CHAPTER = 'FINISH_CHAPTER',
  INCREASE_CORRECT_COUNT = 'INCREASE_CORRECT_COUNT',
  INCREASE_WRONG_COUNT = 'INCREASE_WRONG_COUNT',
  SKIP_WORD = 'SKIP_WORD',
  SKIP_2_WORD_INDEX = 'SKIP_2_WORD_INDEX',
  REPEAT_CHAPTER = 'REPEAT_CHAPTER',
  DICTATION_CHAPTER = 'DICTATION_CHAPTER',
  NEXT_CHAPTER = 'NEXT_CHAPTER',
  TOGGLE_WORD_VISIBLE = 'TOGGLE_WORD_VISIBLE',
  TOGGLE_TRANS_VISIBLE = 'TOGGLE_TRANS_VISIBLE',
  TICK_TIMER = 'TICK_TIMER',
  ADD_WORD_RECORD_ID = 'ADD_WORD_RECORD_ID',
  SET_IS_SAVING_RECORD = 'SET_IS_SAVING_RECORD',
  SET_IS_LOOP_SINGLE_WORD = 'SET_IS_LOOP_SINGLE_WORD',
  TOGGLE_IS_LOOP_SINGLE_WORD = 'TOGGLE_IS_LOOP_SINGLE_WORD',
}

export type TypingStateAction =
  | { type: TypingStateActionType.SETUP_CHAPTER; payload: { words: WordWithIndex[]; shouldShuffle: boolean } }
  | { type: TypingStateActionType.SET_IS_SKIP; payload: boolean }
  | { type: TypingStateActionType.SET_IS_TYPING; payload: boolean }
  | { type: TypingStateActionType.TOGGLE_IS_TYPING }
  | { type: TypingStateActionType.REPORT_WRONG_WORD }
  | { type: TypingStateActionType.REPORT_CORRECT_WORD }
  | { type: TypingStateActionType.NEXT_WORD }
  | { type: TypingStateActionType.LOOP_CURRENT_WORD }
  | { type: TypingStateActionType.FINISH_CHAPTER }
  | { type: TypingStateActionType.INCREASE_CORRECT_COUNT }
  | { type: TypingStateActionType.INCREASE_WRONG_COUNT }
  | { type: TypingStateActionType.SKIP_WORD }
  | { type: TypingStateActionType.SKIP_2_WORD_INDEX; newIndex: number }
  | { type: TypingStateActionType.REPEAT_CHAPTER; shouldShuffle: boolean }
  | { type: TypingStateActionType.DICTATION_CHAPTER; shouldShuffle: boolean }
  | { type: TypingStateActionType.NEXT_CHAPTER }
  | { type: TypingStateActionType.TOGGLE_WORD_VISIBLE }
  | { type: TypingStateActionType.TOGGLE_TRANS_VISIBLE }
  | { type: TypingStateActionType.TICK_TIMER; addTime?: number }
  | { type: TypingStateActionType.ADD_WORD_RECORD_ID; payload: number }
  | { type: TypingStateActionType.SET_IS_SAVING_RECORD; payload: boolean }
  | { type: TypingStateActionType.SET_IS_LOOP_SINGLE_WORD; payload: boolean }
  | { type: TypingStateActionType.TOGGLE_IS_LOOP_SINGLE_WORD }

type Dispatch = (action: TypingStateAction) => void

export const typingReducer = (state: TypingState, action: TypingStateAction) => {
  switch (action.type) {
    case TypingStateActionType.SETUP_CHAPTER:
      state.chapterData.words = action.payload.shouldShuffle ? shuffle(action.payload.words) : action.payload.words
      break
    case TypingStateActionType.SET_IS_SKIP:
      state.isShowSkip = action.payload
      break
    case TypingStateActionType.SET_IS_TYPING:
      state.isTyping = action.payload
      break

    case TypingStateActionType.TOGGLE_IS_TYPING:
      state.isTyping = !state.isTyping
      break
    case TypingStateActionType.REPORT_WRONG_WORD: {
      const wordIndex = state.chapterData.words[state.chapterData.index].index

      const prevIndex = state.chapterData.wrongWordIndexes.indexOf(wordIndex)
      if (prevIndex === -1) {
        state.chapterData.wrongWordIndexes.push(wordIndex)
      }
      break
    }
    case TypingStateActionType.REPORT_CORRECT_WORD: {
      const wordIndex = state.chapterData.words[state.chapterData.index].index

      const prevWrongIndex = state.chapterData.wrongWordIndexes.indexOf(wordIndex)
      const prevCorrectIndex = state.chapterData.correctWordIndexes.indexOf(wordIndex)

      // 如果之前没有被记录过 出现错误或者正确
      if (prevCorrectIndex === -1 && prevWrongIndex === -1) {
        state.chapterData.correctWordIndexes.push(wordIndex)
      }
      break
    }
    case TypingStateActionType.NEXT_WORD:
      state.chapterData.index += 1
      state.chapterData.wordCount += 1
      state.isShowSkip = false
      break
    case TypingStateActionType.LOOP_CURRENT_WORD:
      state.isShowSkip = false
      state.chapterData.wordCount += 1
      break
    case TypingStateActionType.FINISH_CHAPTER:
      state.chapterData.wordCount += 1
      state.isTyping = false
      state.isFinished = true
      state.isShowSkip = false
      break
    case TypingStateActionType.INCREASE_CORRECT_COUNT:
      state.chapterData.correctCount += 1
      break
    case TypingStateActionType.INCREASE_WRONG_COUNT:
      state.chapterData.wrongCount += 1
      break
    case TypingStateActionType.SKIP_WORD: {
      const newIndex = state.chapterData.index + 1
      if (newIndex >= state.chapterData.words.length) {
        state.isTyping = false
        state.isFinished = true
      } else {
        state.chapterData.index = newIndex
      }
      state.isShowSkip = false
      break
    }
    case TypingStateActionType.SKIP_2_WORD_INDEX: {
      const newIndex = action.newIndex
      if (newIndex >= state.chapterData.words.length) {
        state.isTyping = false
        state.isFinished = true
      }
      state.chapterData.index = newIndex
      break
    }
    case TypingStateActionType.REPEAT_CHAPTER: {
      const newState = structuredClone(initialState)
      newState.isTyping = true
      newState.chapterData.words = action.shouldShuffle ? shuffle(state.chapterData.words) : state.chapterData.words
      newState.isTransVisible = state.isTransVisible
      return newState
    }

    case TypingStateActionType.DICTATION_CHAPTER: {
      const newState = structuredClone(initialState)
      newState.isTyping = true
      newState.chapterData.words = action.shouldShuffle ? shuffle(state.chapterData.words) : state.chapterData.words
      newState.isWordVisible = false
      newState.isTransVisible = state.isTransVisible
      return newState
    }
    case TypingStateActionType.NEXT_CHAPTER: {
      const newState = structuredClone(initialState)
      newState.isTyping = true
      newState.isTransVisible = state.isTransVisible
      return newState
    }
    case TypingStateActionType.TOGGLE_WORD_VISIBLE:
      state.isWordVisible = !state.isWordVisible
      break
    case TypingStateActionType.TOGGLE_TRANS_VISIBLE:
      state.isTransVisible = !state.isTransVisible
      break
    case TypingStateActionType.TICK_TIMER: {
      const increment = action.addTime === undefined ? 1 : action.addTime
      const newTime = state.timerData.time + increment
      const inputSum =
        state.chapterData.correctCount + state.chapterData.wrongCount === 0
          ? 1
          : state.chapterData.correctCount + state.chapterData.wrongCount

      state.timerData.time = newTime
      state.timerData.accuracy = Math.round((state.chapterData.correctCount / inputSum) * 100)
      state.timerData.wpm = Math.round((state.chapterData.wordCount / newTime) * 60)
      break
    }
    case TypingStateActionType.ADD_WORD_RECORD_ID: {
      state.chapterData.wordRecordIds.push(action.payload)
      break
    }
    case TypingStateActionType.SET_IS_SAVING_RECORD: {
      state.isSavingRecord = action.payload
      break
    }
    case TypingStateActionType.SET_IS_LOOP_SINGLE_WORD: {
      state.isLoopSingleWord = action.payload
      break
    }
    case TypingStateActionType.TOGGLE_IS_LOOP_SINGLE_WORD: {
      state.isLoopSingleWord = !state.isLoopSingleWord
      break
    }
    default: {
      return state
    }
  }
}

export const TypingContext = createContext<{ state: TypingState; dispatch: Dispatch } | null>(null)

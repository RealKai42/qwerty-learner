import { TypingState } from '@/pages/Typing/store'
import { currentChapterAtom, currentDictInfoAtom } from '@/store'
import Dexie, { Table } from 'dexie'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { WordRecord, ChapterRecord, IWordRecord, IChapterRecord, LetterMistakes } from './record'

class RecordDB extends Dexie {
  wordRecords!: Table<IWordRecord, number>
  chapterRecords!: Table<IChapterRecord, number>

  constructor() {
    super('RecordDB')
    this.version(1).stores({
      wordRecords: '++id,word,timeStamp,dict,chapter,errorCount',
      chapterRecords: '++id,timeStamp,dict,chapter,time',
    })
  }
}

export const db = new RecordDB()

db.wordRecords.mapToClass(WordRecord)
db.chapterRecords.mapToClass(ChapterRecord)

export function useSaveChapterRecord() {
  const currentChapter = useAtomValue(currentChapterAtom)
  const { id: dictID } = useAtomValue(currentDictInfoAtom)

  const saveChapterRecord = useCallback(
    (typingState: TypingState) => {
      const {
        chapterData: { correctCount, wrongCount, wordCount, correctWordIndexes, words },
        timerData: { time },
      } = typingState
      const chapterRecord = new ChapterRecord(
        dictID,
        currentChapter + 1,
        time,
        correctCount,
        wrongCount,
        wordCount,
        correctWordIndexes,
        words.length,
      )
      db.chapterRecords.add(chapterRecord)
    },
    [currentChapter, dictID],
  )

  return saveChapterRecord
}

export type WordKeyLogger = {
  letterTimeArray: number[]
  letterMistake: LetterMistakes
}

export function useSaveWordRecord() {
  const currentChapter = useAtomValue(currentChapterAtom)
  const { id: dictID } = useAtomValue(currentDictInfoAtom)

  const saveWordRecord = useCallback(
    (word: string, errorCount: number, wordKeyLogger: WordKeyLogger) => {
      const { letterTimeArray, letterMistake } = wordKeyLogger
      const timing = []
      for (let i = 1; i < letterTimeArray.length; i++) {
        const diff = letterTimeArray[i] - letterTimeArray[i - 1]
        timing.push(diff)
      }

      const wordRecord = new WordRecord(word, dictID, currentChapter, timing, errorCount, letterMistake)
      db.wordRecords.add(wordRecord)
    },
    [currentChapter, dictID],
  )

  return saveWordRecord
}

import { TypingState } from '@/pages/Typing/store'
import { currentChapterAtom, currentDictInfoAtom } from '@/store'
import Dexie, { Table } from 'dexie'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { WordRecord, ChapterRecord, IWordRecord, IChapterRecord } from './record'

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
        currentChapter,
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

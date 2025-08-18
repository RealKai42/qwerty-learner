import type { IChapterRecord, IReviewRecord, IRevisionDictRecord, IWordProficiency, IWordRecord, LetterMistakes } from './record'
import { ChapterRecord, ReviewRecord, WordProficiency, WordRecord } from './record'
import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import type { TypingState } from '@/pages/Typing/store/type'
import { currentChapterAtom, currentDictIdAtom, isReviewModeAtom } from '@/store'
import type { Table } from 'dexie'
import Dexie from 'dexie'
import { useAtomValue } from 'jotai'
import { useCallback, useContext } from 'react'

class RecordDB extends Dexie {
  wordRecords!: Table<IWordRecord, number>
  chapterRecords!: Table<IChapterRecord, number>
  reviewRecords!: Table<IReviewRecord, number>
  wordProficiency!: Table<IWordProficiency, number>

  revisionDictRecords!: Table<IRevisionDictRecord, number>
  revisionWordRecords!: Table<IWordRecord, number>

  constructor() {
    super('RecordDB')
    this.version(1).stores({
      wordRecords: '++id,word,timeStamp,dict,chapter,errorCount,[dict+chapter]',
      chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
    })
    this.version(2).stores({
      wordRecords: '++id,word,timeStamp,dict,chapter,wrongCount,[dict+chapter]',
      chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
    })
    this.version(3).stores({
      wordRecords: '++id,word,timeStamp,dict,chapter,wrongCount,[dict+chapter]',
      chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
      reviewRecords: '++id,dict,createTime,isFinished',
    })
    this.version(4).stores({
      wordRecords: '++id,word,timeStamp,dict,chapter,wrongCount,[dict+chapter]',
      chapterRecords: '++id,timeStamp,dict,chapter,time,[dict+chapter]',
      reviewRecords: '++id,dict,createTime,isFinished',
      wordProficiency: '++id,word,dict,status,rememberedUntil,[word+dict]',
    })
  }
}

export const db = new RecordDB()

db.wordRecords.mapToClass(WordRecord)
db.chapterRecords.mapToClass(ChapterRecord)
db.reviewRecords.mapToClass(ReviewRecord)
db.wordProficiency.mapToClass(WordProficiency)

export function useSaveChapterRecord() {
  const currentChapter = useAtomValue(currentChapterAtom)
  const isRevision = useAtomValue(isReviewModeAtom)
  const dictID = useAtomValue(currentDictIdAtom)

  const saveChapterRecord = useCallback(
    (typingState: TypingState) => {
      const {
        chapterData: { correctCount, wrongCount, userInputLogs, wordCount, words, wordRecordIds },
        timerData: { time },
      } = typingState
      const correctWordIndexes = userInputLogs.filter((log) => log.correctCount > 0 && log.wrongCount === 0).map((log) => log.index)

      const chapterRecord = new ChapterRecord(
        dictID,
        isRevision ? -1 : currentChapter,
        time,
        correctCount,
        wrongCount,
        wordCount,
        correctWordIndexes,
        words.length,
        wordRecordIds ?? [],
      )
      db.chapterRecords.add(chapterRecord)
    },
    [currentChapter, dictID, isRevision],
  )

  return saveChapterRecord
}

export type WordKeyLogger = {
  letterTimeArray: number[]
  letterMistake: LetterMistakes
}

export function useSaveWordRecord() {
  const isRevision = useAtomValue(isReviewModeAtom)
  const currentChapter = useAtomValue(currentChapterAtom)
  const dictID = useAtomValue(currentDictIdAtom)

  const { dispatch } = useContext(TypingContext) ?? {}

  const saveWordRecord = useCallback(
    async ({
      word,
      wrongCount,
      letterTimeArray,
      letterMistake,
    }: {
      word: string
      wrongCount: number
      letterTimeArray: number[]
      letterMistake: LetterMistakes
    }) => {
      const timing = []
      for (let i = 1; i < letterTimeArray.length; i++) {
        const diff = letterTimeArray[i] - letterTimeArray[i - 1]
        timing.push(diff)
      }

      const wordRecord = new WordRecord(word, dictID, isRevision ? -1 : currentChapter, timing, wrongCount, letterMistake)

      let dbID = -1
      try {
        dbID = await db.wordRecords.add(wordRecord)
      } catch (e) {
        console.error(e)
      }
      if (dispatch) {
        dbID > 0 && dispatch({ type: TypingStateActionType.ADD_WORD_RECORD_ID, payload: dbID })
        dispatch({ type: TypingStateActionType.SET_IS_SAVING_RECORD, payload: false })
      }
    },
    [currentChapter, dictID, dispatch, isRevision],
  )

  return saveWordRecord
}

export function useDeleteWordRecord() {
  const deleteWordRecord = useCallback(async (word: string, dict: string) => {
    try {
      const deletedCount = await db.wordRecords.where({ word, dict }).delete()
      return deletedCount
    } catch (error) {
      console.error(`删除单词记录时出错：`, error)
    }
  }, [])

  return { deleteWordRecord }
}

export function useSaveWordProficiency() {
  const dictID = useAtomValue(currentDictIdAtom)

  const saveWordProficiency = useCallback(
    async ({ word, status, rememberedDays = 7 }: { word: string; status: 'known' | 'remembered' | 'unknown'; rememberedDays?: number }) => {
      try {
        // 计算记忆到期时间（如果状态是"remembered"）
        const rememberedUntil = status === 'remembered' ? Date.now() + rememberedDays * 24 * 60 * 60 * 1000 : undefined

        // 查找是否已存在该单词的熟练度记录
        const existingRecord = await db.wordProficiency.where({ word, dict: dictID }).first()

        if (existingRecord) {
          // 更新现有记录
          await db.wordProficiency.update(existingRecord.id as number, {
            status,
            rememberedUntil,
            timeStamp: Date.now(),
          })
        } else {
          // 创建新记录
          const proficiency = new WordProficiency(word, dictID, status, rememberedUntil)
          await db.wordProficiency.add(proficiency)
        }

        return true
      } catch (e) {
        console.error('保存单词熟练度时出错：', e)
        return false
      }
    },
    [dictID],
  )

  return saveWordProficiency
}

export function useGetWordProficiency() {
  const dictID = useAtomValue(currentDictIdAtom)

  const getWordProficiency = useCallback(
    async (word: string) => {
      try {
        const record = await db.wordProficiency.where({ word, dict: dictID }).first()
        return record || { status: 'unknown', rememberedUntil: undefined }
      } catch (e) {
        console.error('获取单词熟练度时出错：', e)
        return { status: 'unknown', rememberedUntil: undefined }
      }
    },
    [dictID],
  )

  return getWordProficiency
}

export function useResetWordProficiency() {
  const dictID = useAtomValue(currentDictIdAtom)

  const resetWordProficiency = useCallback(
    async (word: string) => {
      try {
        const deletedCount = await db.wordProficiency.where({ word, dict: dictID }).delete()
        return deletedCount > 0
      } catch (e) {
        console.error('重置单词熟练度时出错：', e)
        return false
      }
    },
    [dictID],
  )

  return resetWordProficiency
}

import { db } from './core'
import { putStudyRecord } from './memo-rollover'
import type { LetterMistakes } from './record'
import { ChapterRecord, ReviewRecord, WordRecord } from './record'
import { TypingContext, TypingStateActionType } from '@/pages/Typing/store'
import type { TypingState } from '@/pages/Typing/store/type'
import { currentChapterAtom, currentDictIdAtom, currentDictInfoAtom, isReviewModeAtom } from '@/store'
import type { PracticeContentType } from '@/typings'
import { hasTextItems } from '@/utils/practice'
import { useAtomValue } from 'jotai'
import { useCallback, useContext } from 'react'

export { db } from './core'

db.wordRecords.mapToClass(WordRecord)
db.chapterRecords.mapToClass(ChapterRecord)
db.reviewRecords.mapToClass(ReviewRecord)

export function useSaveChapterRecord() {
  const dictionaryRevision = useAtomValue(currentDictInfoAtom).wordListRevision
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
      chapterRecord.dictionaryRevision = dictionaryRevision
      if (hasTextItems(words)) {
        chapterRecord.statisticsVersion = 2
        chapterRecord.characterCount = correctCount
      }
      void putStudyRecord(db.chapterRecords, chapterRecord)
    },
    [currentChapter, dictID, isRevision, dictionaryRevision],
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
      contentType,
      practiceText,
      characterCount,
    }: {
      word: string
      wrongCount: number
      letterTimeArray: number[]
      letterMistake: LetterMistakes
      contentType?: PracticeContentType
      practiceText?: string
      characterCount?: number
    }) => {
      const timing = []
      for (let i = 1; i < letterTimeArray.length; i++) {
        const diff = letterTimeArray[i] - letterTimeArray[i - 1]
        timing.push(diff)
      }

      const wordRecord = new WordRecord(word, dictID, isRevision ? -1 : currentChapter, timing, wrongCount, letterMistake)
      if (contentType && contentType !== 'word') {
        wordRecord.contentType = contentType
        wordRecord.practiceText = practiceText
        wordRecord.characterCount = characterCount
        wordRecord.statisticsVersion = 2
      }

      let dbID = -1
      try {
        dbID = await putStudyRecord(db.wordRecords, wordRecord)
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

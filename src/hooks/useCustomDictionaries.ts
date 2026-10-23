import { currentChapterAtom, currentDictIdAtom, reviewModeInfoAtom } from '@/store'
import {
  customDictionariesAtom,
  dictionariesErrorAtom,
  dictionariesReadyAtom,
  dictionaryMapAtom,
  dictionaryMetadata,
} from '@/store/dictionaries'
import { db } from '@/utils/db/core'
import { liveQuery } from 'dexie'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

export function useCustomDictionaries() {
  const setDictionaries = useSetAtom(customDictionariesAtom)
  const setReady = useSetAtom(dictionariesReadyAtom)
  const setError = useSetAtom(dictionariesErrorAtom)
  const [currentId, setCurrentId] = useAtom(currentDictIdAtom)
  const dictionaryMap = useAtomValue(dictionaryMapAtom)
  const setChapter = useSetAtom(currentChapterAtom)
  const setReview = useSetAtom(reviewModeInfoAtom)

  useEffect(() => {
    const dictionary = dictionaryMap[currentId]
    if (dictionary && dictionary.id !== currentId) {
      setCurrentId(dictionary.id)
      setChapter(0)
      setReview((previous) => ({ ...previous, isReviewMode: false, reviewRecord: undefined }))
    }
  }, [currentId, dictionaryMap, setCurrentId, setChapter, setReview])

  useEffect(() => {
    const subscription = liveQuery(() => db.customDictionaries.orderBy('studyDate').reverse().toArray()).subscribe({
      next: (records) => {
        setDictionaries(records.map(dictionaryMetadata))
        setError(false)
        setReady(true)
      },
      error: () => {
        setError(true)
        setReady(true)
      },
    })
    return () => subscription.unsubscribe()
  }, [setDictionaries, setError, setReady])
}

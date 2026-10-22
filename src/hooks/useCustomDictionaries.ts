import { customDictionariesAtom, dictionariesErrorAtom, dictionariesReadyAtom, dictionaryMetadata } from '@/store/dictionaries'
import { db } from '@/utils/db/core'
import { liveQuery } from 'dexie'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

export function useCustomDictionaries() {
  const setDictionaries = useSetAtom(customDictionariesAtom)
  const setReady = useSetAtom(dictionariesReadyAtom)
  const setError = useSetAtom(dictionariesErrorAtom)
  useEffect(() => {
    const subscription = liveQuery(() => db.customDictionaries.orderBy('studyDate').reverse().toArray()).subscribe({
      next: (records) => {
        // Word data stays in IndexedDB; global state only needs metadata.
        setDictionaries(records.map(dictionaryMetadata))
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

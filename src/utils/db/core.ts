import type { IChapterRecord, IReviewRecord, IRevisionDictRecord, IWordRecord } from './record'
import type { StoredDictionary } from '@/typings/personal'
import Dexie from 'dexie'
import type { Table } from 'dexie'

class RecordDB extends Dexie {
  wordRecords!: Table<IWordRecord, number>
  chapterRecords!: Table<IChapterRecord, number>
  reviewRecords!: Table<IReviewRecord, number>
  revisionDictRecords!: Table<IRevisionDictRecord, number>
  revisionWordRecords!: Table<IWordRecord, number>
  customDictionaries!: Table<StoredDictionary, string>

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
    this.version(4).stores({ customDictionaries: 'id,studyDate,updatedAt' })
  }
}

export const db = new RecordDB()

import Dexie, { Table } from 'dexie'
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

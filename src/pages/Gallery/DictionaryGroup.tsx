import React from 'react'
import { DictionaryResource } from '@/typings'
import DictionaryCard from './DictionaryCard'

const DictionaryGroup: React.FC<DictionaryGroupProps> = ({ title, dictionaries }) => {
  return (
    <section className="mb-4 mr-1">
      <h3 className="sticky top-0 z-50 bg-indigo-50 pb-2 text-sm font-bold text-gray-600 dark:bg-slate-800 dark:text-white dark:text-opacity-60">
        {title}
      </h3>
      <main className="grid gap-4 rounded-md sm:grid-cols-1 md:grid-cols-2">
        {dictionaries.map((dict) => (
          <DictionaryCard key={dict.id} dictionary={dict} />
        ))}
      </main>
    </section>
  )
}

export default DictionaryGroup

export type DictionaryGroupProps = { title: string; dictionaries: DictionaryResource[] }

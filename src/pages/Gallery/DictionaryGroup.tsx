import React from 'react'
import { Dictionary } from 'resources/dictionary'
import DictionaryCard from './DictionaryCard'

const DictionaryGroup: React.FC<DictionaryGroupProps> = ({ title, dictionaries }) => {
  return (
    <section className="mb-2 mr-4">
      <h3 className="mb-2 text-sm font-bold text-gray-600 dark:text-white dark:text-opacity-60">{title}</h3>
      <main className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {dictionaries.map((dict) => (
          <DictionaryCard key={dict.id} dictionary={dict} />
        ))}
      </main>
    </section>
  )
}

export default DictionaryGroup

export type DictionaryGroupProps = { title: string; dictionaries: Dictionary[] }

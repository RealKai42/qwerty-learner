import React from 'react'
import { Dictionary } from 'resources/dictionary'
import DictionaryCard from './DictionaryCard'

const DictionaryGroup: React.FC<DictionaryGroupProps> = ({ title, dictionaries }) => {
  return (
    <section>
      <h3 className="mb-2 text-lg font-bold text-gray-600">{title}</h3>
      <main className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {dictionaries.map((dict) => (
          <DictionaryCard key={dict.id} dictionary={dict} />
        ))}
      </main>
    </section>
  )
}

export default DictionaryGroup

export type DictionaryGroupProps = { title: string; dictionaries: Dictionary[] }

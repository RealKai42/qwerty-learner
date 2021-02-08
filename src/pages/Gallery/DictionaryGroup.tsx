import React from 'react'
import { Dictionary } from 'resources/dictionary'
import DictionaryCard from './DictionaryCard'

const DictionaryGroup: React.FC<DictionaryGroupProps> = ({ title, dictionaries }) => {
  return (
    <section>
      <h3 className="mb-2 text-sm font-bold text-gray-600">{title}</h3>
      <main className="flex flex-col space-y-4">
        {dictionaries.map((dict) => (
          <DictionaryCard key={dict.id} dictionary={dict} />
        ))}
      </main>
    </section>
  )
}

export default DictionaryGroup

export type DictionaryGroupProps = { title: string; dictionaries: Dictionary[] }

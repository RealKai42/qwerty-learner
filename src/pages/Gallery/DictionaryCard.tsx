import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { noop } from 'lodash'
import React from 'react'
import { Dictionary } from 'resources/dictionary'
import { useSelectedDictionary } from 'store/AppState'

const DictionaryCard: React.FC<DictionaryCardProps> = ({ dictionary, onClick = noop }) => {
  const selectedDictionary = useSelectedDictionary()
  return (
    <button className="p-4 bg-indigo-50 shadow-lg rounded-md text-left" onClick={() => onClick(dictionary.id)}>
      <div className="flex items-center">
        <p className="text-xl text-gray-900">{dictionary.name}</p>
        {selectedDictionary.id === dictionary.id ? (
          <FontAwesomeIcon className="ml-auto text-2xl text-green-600" icon={['fas', 'check-circle']} fixedWidth />
        ) : null}
      </div>
      <p className="font-bold text-gray-600">{dictionary.length} 词</p>
    </button>
  )
}

DictionaryCard.displayName = 'DictionaryCard'

export type DictionaryCardProps = {
  dictionary: Dictionary
  onClick?: (id: string) => void
}

export default DictionaryCard

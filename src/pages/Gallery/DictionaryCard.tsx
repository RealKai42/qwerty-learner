import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useRef } from 'react'
import { Dictionary } from '@/resources/dictionary'
import { useSelectedDictionary, useSetDictionary } from '@/store/AppState'

const DictionaryCard: React.FC<DictionaryCardProps> = ({ dictionary }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const selectedDictionary = useSelectedDictionary()
  const setDictionary = useSetDictionary()
  useEffect(() => {
    if (selectedDictionary.id === dictionary.id && buttonRef.current !== null) {
      const button = buttonRef.current
      const container = button.parentElement?.parentElement?.parentElement
      const halfHeight = button.getBoundingClientRect().height / 2
      container?.scrollTo({ top: Math.max(button.offsetTop - container.offsetTop - halfHeight, 0), behavior: 'smooth' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <button
      ref={buttonRef}
      className="relative w-48 overflow-hidden rounded-md border border-gray-300 bg-gray-50 p-4 text-left shadow-lg focus:outline-none dark:border-gray-500 dark:bg-gray-700 dark:bg-opacity-10 "
      onClick={setDictionary.bind(null, dictionary.id)}
    >
      <p className="mb-1 text-xl text-gray-800 dark:text-white dark:text-opacity-80">{dictionary.name}</p>
      <p className="mb-1 text-xs text-gray-900 dark:text-white dark:text-opacity-90">{dictionary.description}</p>
      <p className="text-sm font-bold text-gray-600 dark:text-white dark:text-opacity-60">{dictionary.length} 词</p>
      {selectedDictionary.id === dictionary.id ? (
        <FontAwesomeIcon
          className="absolute -right-4 -bottom-4 text-6xl text-green-500 opacity-60 dark:text-green-300"
          icon={['fas', 'check-circle']}
          fixedWidth
        />
      ) : null}
    </button>
  )
}

DictionaryCard.displayName = 'DictionaryCard'

export type DictionaryCardProps = {
  dictionary: Dictionary
}

export default DictionaryCard

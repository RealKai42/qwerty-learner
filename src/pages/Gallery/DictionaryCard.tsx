import { currentChapterAtom, currentDictIdAtom } from '@/store'
import type { Dictionary } from '@/typings'
import { useAtom, useSetAtom } from 'jotai'
import type React from 'react'
import { useEffect, useRef } from 'react'
import IconCheckCircle from '~icons/heroicons/check-circle-solid'

const DictionaryCard: React.FC<DictionaryCardProps> = ({ dictionary }) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [currentDictId, setCurrentDictId] = useAtom(currentDictIdAtom)
  const setCurrentChapter = useSetAtom(currentChapterAtom)

  useEffect(() => {
    if (currentDictId === dictionary.id && buttonRef.current !== null) {
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
      type="button"
      onClick={() => {
        setCurrentDictId(dictionary.id)
        setCurrentChapter(0)
      }}
      title="选择词典"
    >
      <p className="mb-1 text-xl text-gray-800 dark:text-white dark:text-opacity-80">{dictionary.name}</p>
      <p className="mb-1 text-xs text-gray-900 dark:text-white dark:text-opacity-90">{dictionary.description}</p>
      <p className="text-sm font-bold text-gray-600 dark:text-white dark:text-opacity-60">{dictionary.length} 词</p>
      {currentDictId === dictionary.id ? (
        <IconCheckCircle className="absolute -bottom-4 -right-4 h-18 w-18 text-6xl text-green-500 opacity-60 dark:text-green-300" />
      ) : null}
    </button>
  )
}

DictionaryCard.displayName = 'DictionaryCard'

export type DictionaryCardProps = {
  dictionary: Dictionary
}

export default DictionaryCard

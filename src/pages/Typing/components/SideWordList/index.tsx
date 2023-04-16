import React from 'react'
import { Word } from '@/typings'

interface SideWordListProps {
  words: Word[]
  index: number
  isVisible: boolean
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
  onWordClick: (index: number) => void
}

const SideWordList: React.FC<SideWordListProps> = ({ words, index, isVisible, setIsVisible, onWordClick }) => {
  const handleWordClick = (index: number) => {
    onWordClick(index)
    setIsVisible(false)
  }

  const handleButtonClick = () => {
    setIsVisible(!isVisible)
  }

  return (
    <div className="fixed left-0 z-10 h-screen">
      <div
        className={`relative transform overflow-y-auto rounded-r-2xl border-2 border-indigo-400 bg-indigo-50 p-5 pl-8 shadow-md transition-transform duration-300 dark:bg-gray-800  ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {words.map((word, i) => (
          <div
            key={i}
            onClick={() => handleWordClick(i)}
            className={`cursor-pointer rounded-lg border-2 border-indigo-50 px-3 py-1 transition-all duration-100 ease-in-out hover:border-indigo-300 hover:bg-white dark:border-gray-800 dark:hover:border-gray-100 dark:hover:bg-indigo-400 ${
              i === index ? 'font-bold text-indigo-500 dark:text-indigo-500' : 'dark:text-gray-100'
            }`}
          >
            {word.name}
          </div>
        ))}
      </div>
      <button
        onClick={handleButtonClick}
        className={`absolute top-1/3 left-${
          isVisible ? '80' : '0'
        } -translate-y-1/2 transform rounded-r-full border-2 border-indigo-500 bg-white px-2 py-1 font-bold text-indigo-500 transition-all duration-300`}
      >
        {isVisible ? 'X' : '...'}
      </button>
    </div>
  )
}

export default SideWordList

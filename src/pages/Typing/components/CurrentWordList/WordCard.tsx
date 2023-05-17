import { Word } from '@/typings'

export default function WordCard({ word, isActive }: { word: Word; isActive: boolean }) {
  return (
    <div
      className={`mb-2 rounded-xl ${
        isActive ? 'bg-indigo-50' : 'bg-white'
      }   p-4 shadow focus:outline-none dark:border-gray-500 dark:bg-gray-700 dark:bg-opacity-10`}
      key={word.name}
    >
      <p className="font-mono text-xl font-normal leading-6 dark:text-gray-50">{word.name}</p>
      <div className="mt-2 font-sans text-sm text-gray-400">{word.trans}</div>
    </div>
  )
}

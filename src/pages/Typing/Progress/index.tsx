import React, { useEffect, useState } from 'react'

export type ProgressProps = {
  order: number
  wordsLength: number
}

const Progress: React.FC<ProgressProps> = ({ order, wordsLength }) => {
  const [progress, setProgress] = useState<number>(0)
  const [phase, setPhase] = useState<number>(0)

  const colorSwitcher: { [key: number]: string } = {
    0: 'bg-indigo-200 dark:bg-indigo-300',
    1: 'bg-indigo-300 dark:bg-indigo-400',
    2: 'bg-indigo-400 dark:bg-indigo-500',
  }

  useEffect(() => {
    const newProgress = Math.floor((order / wordsLength) * 100)
    setProgress(newProgress)
    const colorPhase = Math.floor(newProgress / 33.4)
    setPhase(colorPhase)
  }, [order, wordsLength])

  return (
    <div className="relative pt-1 w-1/4 mt-auto">
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-large bg-indigo-100 dark:bg-indigo-200 transition-all duration-300">
        <div
          style={{ width: `${progress}%` }}
          className={`rounded-large shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ${
            colorSwitcher[phase] ?? 'bg-indigo-200 dark:bg-indigo-300'
          }`}
        ></div>
      </div>
    </div>
  )
}

export default Progress

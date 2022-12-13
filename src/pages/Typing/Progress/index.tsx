import React, { useEffect } from 'react'

export type ProgressProps = {
  order: number
  wordsLength: number
}

const Progress: React.FC<ProgressProps> = ({ order, wordsLength }) => {
  const [progress, setProgress] = React.useState<number>(0)
  const [phase, setPhase] = React.useState<number>(0)

  const colorSwitcher: { [key: number]: string } = {
    0: 'bg-indigo-200 dark:bg-indigo-300',
    1: 'bg-indigo-300 dark:bg-indigo-400',
    2: 'bg-indigo-400 dark:bg-indigo-500',
  }

  useEffect(() => {
    const calcResult = Math.floor((order / wordsLength) * 100)
    setProgress(calcResult > 100 ? 100 : calcResult)
    const colorPhase = Math.floor(progress / 33.4)
    setPhase(colorPhase)
  }, [order, wordsLength, progress])

  return (
    <div className="relative pt-1 w-1/4 mt-auto">
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-large bg-indigo-100 dark:bg-indigo-200 transition-all duration-300">
        <div
          style={{ width: `${progress}%` }}
          className={`rounded-large shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ${
            colorSwitcher[phase] ?? 0
          }`}
        ></div>
      </div>
    </div>
  )
}

export default Progress

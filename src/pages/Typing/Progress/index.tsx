import React, { useEffect } from 'react'

export type ProgressProps = {
  order: number
  wordsLength: number
}

const Progress: React.FC<ProgressProps> = ({ order, wordsLength }) => {
  const [progress, setProgress] = React.useState<number>(0)
  const [phase, setPhase] = React.useState<number>(0)

  useEffect(() => {
    const calcResult = Math.floor((order / wordsLength) * 100)
    setProgress(calcResult > 100 ? 100 : calcResult)
  }, [order, wordsLength])

  //color has to be 100's multiple
  useEffect(() => {
    const colorLevel = Math.floor(progress / 33.4)
    setTimeout(() => {
      setPhase(colorLevel)
    }, 300)
  }, [progress])

  return (
    <div className="relative pt-1 w-1/4 mt-auto">
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-large bg-indigo-100 dark:bg-indigo-200 transition-all duration-300">
        {phase === 0 && (
          <div
            style={{ width: `${progress}%` }}
            className={`rounded-large shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 bg-indigo-200 dark:bg-indigo-300`}
          ></div>
        )}
        {phase === 1 && (
          <div
            style={{ width: `${progress}%` }}
            className={`rounded-large shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 bg-indigo-300 dark:bg-indigo-400`}
          ></div>
        )}
        {phase === 2 && (
          <div
            style={{ width: `${progress}%` }}
            className={`rounded-large shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 bg-indigo-400 dark:bg-indigo-500`}
          ></div>
        )}
      </div>
    </div>
  )
}

export default Progress

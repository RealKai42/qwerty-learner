import React, { useEffect } from 'react'
import { useStopwatch } from 'react-timer-hook'
import InfoBox from './InfoBox'

const Speed: React.FC<SpeedProps> = ({ correctCount, inputCount, isStart }) => {
  const { seconds, minutes, hours, days, start, pause } = useStopwatch({ autoStart: false })
  const correctRate = (correctCount / (inputCount === 0 ? 1 : inputCount)).toFixed(2)
  const time = seconds + minutes * 60 + hours * 60 * 60 + days * 12 * 60 * 60
  const speed = (correctCount / (time === 0 ? 1 : time)).toFixed(2)
  const secondsStirng = seconds < 10 ? '0' + seconds : seconds + ''
  const minutesStirng = minutes < 10 ? '0' + minutes : minutes + ''
  useEffect(() => {
    isStart ? start() : pause()
  }, [isStart, start, pause])

  return (
    <div className="w-3/5 flex bg-white dark:bg-gray-800 transition-colors duration-300 mt-auto rounded-large card p-4 py-10 opacity-45">
      <InfoBox info={`${minutesStirng}:${secondsStirng}`} description="时间" />
      <InfoBox info={inputCount + ''} description="输入数" />
      <InfoBox info={speed + ''} description="速度" />
      <InfoBox info={correctCount + ''} description="正确数" />
      <InfoBox info={correctRate + ''} description="正确率" />
    </div>
  )
}

export type SpeedProps = {
  correctCount: number
  inputCount: number
  isStart: boolean
}

export default React.memo(Speed)

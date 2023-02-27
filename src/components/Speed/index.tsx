import { ResultSpeedInfo } from '@/components/ResultScreen'
import React, { useEffect } from 'react'
import { useStopwatch } from 'react-timer-hook'
import InfoBox from './InfoBox'

const Speed: React.FC<SpeedProps> = ({ correctCount, inputCount, isStart, setSpeedInfo }) => {
  const { seconds, minutes, hours, days, start, pause } = useStopwatch({ autoStart: false })
  const correctRate = (correctCount / (inputCount === 0 ? 1 : inputCount)).toFixed(2)
  const time = seconds + minutes * 60 + hours * 60 * 60 + days * 12 * 60 * 60
  const speed = (correctCount / (time === 0 ? 1 : time)).toFixed(2)
  const secondsStirng = seconds < 10 ? '0' + seconds : seconds + ''
  const minutesStirng = minutes < 10 ? '0' + minutes : minutes + ''
  useEffect(() => {
    isStart ? start() : pause()
  }, [isStart, start, pause])

  useEffect(() => {
    setSpeedInfo({ speed, minute: minutes, second: seconds })
  }, [speed, minutes, seconds, setSpeedInfo])

  return (
    <div className="card opacity-45 mt-auto flex w-3/5 rounded-large bg-white p-4 py-10 transition-colors duration-300 dark:bg-gray-800">
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
  setSpeedInfo: React.Dispatch<React.SetStateAction<ResultSpeedInfo>>
}

export default React.memo(Speed)

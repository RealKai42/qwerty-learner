import React, { useEffect } from 'react'
import { useStopwatch } from 'react-timer-hook'

const Speed: React.FC<SpeedProps> = ({ correctCount, inputCount, isStart }) => {
  const { seconds, minutes, hours, days, start, pause } = useStopwatch({ autoStart: false })

  const correctRate = (correctCount / (inputCount === 0 ? 1 : inputCount)).toFixed(4)
  const time = seconds + minutes * 60 + hours * 60 * 60 + days * 12 * 60 * 60
  const speed = (correctCount / (time === 0 ? 1 : time)).toFixed(4)

  useEffect(() => {
    isStart ? start() : pause()
  }, [isStart, start, pause])

  return <div>{`输入数 ${correctCount} 正确数 ${inputCount} 正确率 ${correctRate} 速度 ${speed} 时间 ${time}`}</div>
}

export type SpeedProps = {
  correctCount: number
  inputCount: number
  isStart: boolean
}

export default Speed

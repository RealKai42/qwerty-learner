import { useContext } from 'react'
import InfoBox from './InfoBox'
import { TypingContext } from '../../store'

export default function Speed() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const seconds = state.timerData.time % 60
  const minutes = Math.floor(state.timerData.time / 60)
  const secondsString = seconds < 10 ? '0' + seconds : seconds + ''
  const minutesString = minutes < 10 ? '0' + minutes : minutes + ''
  const inputNumber = state.chapterData.correctCount + state.chapterData.wrongCount

  return (
    <div className="card opacity-45 mt-auto flex w-3/5 rounded-large bg-white p-4 py-10 transition-colors duration-300 dark:bg-gray-800">
      <InfoBox info={`${minutesString}:${secondsString}`} description="时间" />
      <InfoBox info={inputNumber + ''} description="输入数" />
      <InfoBox info={state.timerData.wpm + ''} description="WPM" />
      <InfoBox info={state.chapterData.correctCount + ''} description="正确数" />
      <InfoBox info={state.timerData.accuracy + ''} description="正确率" />
    </div>
  )
}

import { TypingContext } from '../../store'
import InfoBox from './InfoBox'
import { useContext } from 'react'

export default function Speed() {
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const seconds = state.timerData.time % 60
  const minutes = Math.floor(state.timerData.time / 60)
  const secondsString = seconds < 10 ? '0' + seconds : seconds + ''
  const minutesString = minutes < 10 ? '0' + minutes : minutes + ''
  const inputNumber = state.chapterData.correctCount + state.chapterData.wrongCount

  return (
    <div className="flex w-full justify-center px-8 pb-4">
      <div className="my-card flex w-80 rounded-xl bg-white p-4 opacity-50 transition-colors duration-300 dark:bg-gray-800 sm:w-85 lg:w-100">
        <InfoBox info={`${minutesString}:${secondsString}`} description="时间" />
        <InfoBox info={inputNumber + ''} description="输入数" />
        <InfoBox info={state.timerData.wpm + ''} description="WPM" />
        <InfoBox info={state.chapterData.correctCount + ''} description="正确数" />
        <InfoBox info={state.timerData.accuracy + ''} description="正确率" />
      </div>
    </div>
  )
}

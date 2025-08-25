import { TypingContext } from '../../store'
import InfoBox from './InfoBox'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

export default function Speed() {
  const { t } = useTranslation()
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const { state } = useContext(TypingContext)!
  const seconds = state.timerData.time % 60
  const minutes = Math.floor(state.timerData.time / 60)
  const secondsString = seconds < 10 ? '0' + seconds : seconds + ''
  const minutesString = minutes < 10 ? '0' + minutes : minutes + ''
  const inputNumber = state.chapterData.correctCount + state.chapterData.wrongCount

  return (
    <div className="my-card flex w-3/5 rounded-xl bg-white p-4 py-10 opacity-50 transition-colors duration-300 dark:bg-gray-800">
      <InfoBox info={`${minutesString}:${secondsString}`} description={t('speed.time')} />
      <InfoBox info={inputNumber + ''} description={t('speed.input_count')} />
      <InfoBox info={state.timerData.wpm + ''} description={t('speed.wpm')} />
      <InfoBox info={state.chapterData.correctCount + ''} description={t('speed.correct_count')} />
      <InfoBox info={state.timerData.accuracy + ''} description={t('speed.accuracy')} />
    </div>
  )
}

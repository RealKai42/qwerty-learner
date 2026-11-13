import { useTypingContext } from '../../store'
import InfoBox from './InfoBox'
import { useTranslation } from 'react-i18next'

export default function Speed() {
  const { t } = useTranslation()
  const { state } = useTypingContext()
  const seconds = state.timerData.time % 60
  const minutes = Math.floor(state.timerData.time / 60)
  const secondsString = seconds < 10 ? '0' + seconds : seconds + ''
  const minutesString = minutes < 10 ? '0' + minutes : minutes + ''
  const inputNumber = state.chapterData.correctCount + state.chapterData.wrongCount

  return (
    <div className="my-card flex w-4/5 rounded-xl bg-white p-4 py-6 opacity-50 md:w-3/5 md:py-10 transition-colors duration-300 dark:bg-gray-800">
      <InfoBox info={`${minutesString}:${secondsString}`} description={t('typing.speed.time')} />
      <InfoBox info={inputNumber + ''} description={t('typing.speed.inputCount')} />
      <InfoBox info={state.timerData.wpm + ''} description={t('typing.speed.wpm')} />
      <InfoBox info={state.chapterData.correctCount + ''} description={t('typing.speed.correctCount')} />
      <InfoBox info={state.timerData.accuracy + ''} description={t('typing.speed.accuracy')} />
    </div>
  )
}

import { TypingContext, TypingStateActionType } from '../../store'
import AnalysisButton from '../AnalysisButton'
import ErrorBookButton from '../ErrorBookButton'
import HandPositionIllustration from '../HandPositionIllustration'
import LoopWordSwitcher from '../LoopWordSwitcher'
import Setting from '../Setting'
import SoundSwitcher from '../SoundSwitcher'
import WordDictationSwitcher from '../WordDictationSwitcher'
import Tooltip from '@/components/Tooltip'
import { isOpenDarkModeAtom } from '@/store'
import { CTRL } from '@/utils'
import { useAtom } from 'jotai'
import { useContext } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTranslation } from 'react-i18next'
import IconMoon from '~icons/heroicons/moon-solid'
import IconSun from '~icons/heroicons/sun-solid'
import IconLanguage from '~icons/tabler/language'
import IconLanguageOff from '~icons/tabler/language-off'

export default function Switcher() {
  const { t } = useTranslation()
  const [isOpenDarkMode, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const { state, dispatch } = useContext(TypingContext) ?? {}

  const changeDarkModeState = () => {
    setIsOpenDarkMode((old) => !old)
  }

  const changeTransVisibleState = () => {
    if (dispatch) {
      dispatch({ type: TypingStateActionType.TOGGLE_TRANS_VISIBLE })
    }
  }

  useHotkeys(
    'ctrl+shift+v',
    () => {
      changeTransVisibleState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  return (
    <div className="flex items-center justify-center gap-2">
      <Tooltip content={t('app.sound_settings')}>
        <SoundSwitcher />
      </Tooltip>

      <Tooltip className="h-7 w-7" content={t('app.loop_single_word')}>
        <LoopWordSwitcher />
      </Tooltip>

      <Tooltip className="h-7 w-7" content={`${t('app.dictation_mode')}（${CTRL} + V）`}>
        <WordDictationSwitcher />
      </Tooltip>
      <Tooltip className="h-7 w-7" content={`${t('app.toggle_trans')}（${CTRL} + Shift + V）`}>
        <button
          className={`p-[2px] ${state?.isTransVisible ? 'text-indigo-500' : 'text-gray-500'} text-lg focus:outline-none`}
          type="button"
          onClick={(e) => {
            changeTransVisibleState()
            e.currentTarget.blur()
          }}
          aria-label={`${t('app.toggle_trans')}（${CTRL} + Shift + V）`}
        >
          {state?.isTransVisible ? <IconLanguage /> : <IconLanguageOff />}
        </button>
      </Tooltip>

      <Tooltip content={t('app.error_book')}>
        <ErrorBookButton />
      </Tooltip>

      <Tooltip className="h-7 w-7" content={t('app.analysis')}>
        <AnalysisButton />
      </Tooltip>

      <Tooltip className="h-7 w-7" content={t('app.dark_mode')}>
        <button
          className={`p-[2px] text-lg text-indigo-500 focus:outline-none`}
          type="button"
          onClick={(e) => {
            changeDarkModeState()
            e.currentTarget.blur()
          }}
          aria-label={t('app.dark_mode')}
        >
          {isOpenDarkMode ? <IconMoon className="icon" /> : <IconSun className="icon" />}
        </button>
      </Tooltip>
      <Tooltip className="h-7 w-7" content={t('switcher.hand_position_illustration')}>
        <HandPositionIllustration></HandPositionIllustration>
      </Tooltip>
      <Tooltip content={t('switcher.settings')}>
        <Setting />
      </Tooltip>
    </div>
  )
}

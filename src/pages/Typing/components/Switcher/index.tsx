import { TypingContext, TypingStateActionType } from '../../store'
import Setting from '../Setting'
import SoundSwitcher from '../SoundSwitcher'
import Tooltip from '@/components/Tooltip'
import { isOpenDarkModeAtom } from '@/store'
import { useAtom } from 'jotai'
import { useContext } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import IconEyeSlash from '~icons/heroicons/eye-slash-solid'
import IconEye from '~icons/heroicons/eye-solid'
import IconMoon from '~icons/heroicons/moon-solid'
import IconSun from '~icons/heroicons/sun-solid'
import IconLanguage from '~icons/tabler/language'
import IconLanguageOff from '~icons/tabler/language-off'
import IconRepeatOff from '~icons/tabler/repeat-off'
import IconRepeatOnce from '~icons/tabler/repeat-once'

export default function Switcher() {
  const [isOpenDarkMode, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const { state, dispatch } = useContext(TypingContext) ?? {}

  const changeDarkModeState = () => {
    setIsOpenDarkMode((old) => !old)
  }

  const changeWordVisibleState = () => {
    if (dispatch) {
      dispatch({ type: TypingStateActionType.TOGGLE_WORD_VISIBLE })
    }
  }

  const changeTransVisibleState = () => {
    if (dispatch) {
      dispatch({ type: TypingStateActionType.TOGGLE_TRANS_VISIBLE })
    }
  }

  const changeLoopSingleWordState = () => {
    if (dispatch) {
      dispatch({ type: TypingStateActionType.TOGGLE_IS_LOOP_SINGLE_WORD })
    }
  }

  useHotkeys(
    'ctrl+v',
    () => {
      changeWordVisibleState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  useHotkeys(
    'ctrl+d',
    () => {
      changeDarkModeState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )
  useHotkeys(
    'ctrl+t',
    () => {
      changeTransVisibleState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )
  useHotkeys(
    'ctrl+l',
    () => {
      changeLoopSingleWordState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  return (
    <div className="flex items-center justify-center gap-2">
      <Tooltip content="音效设置">
        <SoundSwitcher />
      </Tooltip>

      <Tooltip className="h-7 w-7" content="开关单个单词循环（Ctrl + L）">
        <button
          className={`p-[2px] ${state?.isLoopSingleWord ? 'text-indigo-500' : 'text-gray-500'} text-lg focus:outline-none`}
          type="button"
          onClick={(e) => {
            changeLoopSingleWordState()
            e.currentTarget.blur()
          }}
          aria-label="开关单个单词循环（Ctrl + L）"
        >
          {state?.isLoopSingleWord ? <IconRepeatOnce /> : <IconRepeatOff />}
        </button>
      </Tooltip>
      <Tooltip className="h-7 w-7" content="开关英语显示（Ctrl + V）">
        <button
          className={`p-[2px] ${state?.isWordVisible ? 'text-indigo-500' : 'text-gray-500'} text-lg focus:outline-none`}
          type="button"
          onClick={(e) => {
            changeWordVisibleState()
            e.currentTarget.blur()
          }}
          aria-label="开关英语显示（Ctrl + V）"
        >
          {state?.isWordVisible ? <IconEye className="icon" /> : <IconEyeSlash className="icon" />}
        </button>
      </Tooltip>
      <Tooltip className="h-7 w-7" content="开关释义显示（Ctrl + T）">
        <button
          className={`p-[2px] ${state?.isTransVisible ? 'text-indigo-500' : 'text-gray-500'} text-lg focus:outline-none`}
          type="button"
          onClick={(e) => {
            changeTransVisibleState()
            e.currentTarget.blur()
          }}
          aria-label="开关释义显示（Ctrl + T）"
        >
          {state?.isTransVisible ? <IconLanguage /> : <IconLanguageOff />}
        </button>
      </Tooltip>
      <Tooltip className="h-7 w-7" content="开关深色模式（Ctrl + D）">
        <button
          className={`p-[2px] text-lg text-indigo-500 focus:outline-none`}
          type="button"
          onClick={(e) => {
            changeDarkModeState()
            e.currentTarget.blur()
          }}
          aria-label="开关深色模式（Ctrl + D）"
        >
          {isOpenDarkMode ? <IconMoon className="icon" /> : <IconSun className="icon" />}
        </button>
      </Tooltip>

      <Tooltip content="设置">
        <Setting />
      </Tooltip>
    </div>
  )
}

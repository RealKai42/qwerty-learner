import { TypingContext, TypingStateActionType } from '../../store'
import Setting from '../Setting'
import SoundSwitcher from '../SoundSwitcher'
import Tooltip from '@/components/Tooltip'
import { isLoopSingleWordAtom, isOpenDarkModeAtom } from '@/store'
import { SunIcon, MoonIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid'
import { IconRepeatOnce, IconRepeatOff, IconLanguage, IconLanguageOff } from '@tabler/icons-react'
import { useAtom } from 'jotai'
import { useContext } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export default function Switcher() {
  const [isOpenDarkMode, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)
  const [isLoopSingleWord, setIsLoopSingleWord] = useAtom(isLoopSingleWordAtom)

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
    setIsLoopSingleWord((old) => !old)
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
    <div className="flex items-center justify-center space-x-2">
      <Tooltip content="音效设置">
        <SoundSwitcher />
      </Tooltip>

      <Tooltip className="h-7 w-7" content="开关单个单词循环（Ctrl + L）">
        <button
          className={`p-[2px] ${isLoopSingleWord ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            changeLoopSingleWordState()
            e.currentTarget.blur()
          }}
        >
          {isLoopSingleWord ? <IconRepeatOnce /> : <IconRepeatOff />}
        </button>
      </Tooltip>
      <Tooltip className="h-7 w-7" content="开关英语显示（Ctrl + V）">
        <button
          className={`p-[2px] ${state?.isWordVisible ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            changeWordVisibleState()
            e.currentTarget.blur()
          }}
        >
          {state?.isWordVisible ? <EyeIcon className="icon" /> : <EyeSlashIcon className="icon" />}
        </button>
      </Tooltip>
      <Tooltip className="h-7 w-7" content="开关释义显示（Ctrl + T）">
        <button
          className={`p-[2px] ${state?.isTransVisible ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            changeTransVisibleState()
            e.currentTarget.blur()
          }}
        >
          {state?.isTransVisible ? <IconLanguage /> : <IconLanguageOff />}
        </button>
      </Tooltip>
      <Tooltip className="h-7 w-7" content="开关深色模式（Ctrl + D）">
        <button
          className={`p-[2px] text-lg text-indigo-400 focus:outline-none`}
          onClick={(e) => {
            changeDarkModeState()
            e.currentTarget.blur()
          }}
        >
          {isOpenDarkMode ? <MoonIcon className="icon" /> : <SunIcon className="icon" />}
        </button>
      </Tooltip>

      <Tooltip content="设置">
        <Setting />
      </Tooltip>
    </div>
  )
}

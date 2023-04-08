import { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useHotkeys } from 'react-hotkeys-hook'
import Tooltip from '@/components/Tooltip'
import { useAtom } from 'jotai'
import { isOpenDarkModeAtom, randomConfigAtom } from '@/store'
import { TypingContext, TypingStateActionType } from '../../store'
import SoundSwitcher from '../SoundSwitcher'

export default function Switcher() {
  const [randomConfig, setRandomConfig] = useAtom(randomConfigAtom)
  const [isOpenDarkMode, setIsOpenDarkMode] = useAtom(isOpenDarkModeAtom)

  const { state, dispatch } = useContext(TypingContext) ?? {}

  const changeRandomState = () => {
    setRandomConfig((old) => ({ ...old, isOpen: !old.isOpen }))
  }
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

  useHotkeys(
    'ctrl+v',
    (e) => {
      e.preventDefault()
      changeWordVisibleState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  useHotkeys(
    'ctrl+u',
    (e) => {
      e.preventDefault()
      changeRandomState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )
  useHotkeys(
    'ctrl+d',
    (e) => {
      e.preventDefault()
      changeDarkModeState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )
  useHotkeys(
    'ctrl+t',
    (e) => {
      e.preventDefault()
      changeTransVisibleState()
    },
    { enableOnFormTags: true, preventDefault: true },
    [],
  )

  return (
    <div className="flex items-center justify-center space-x-3">
      <Tooltip content="音效设置">
        <SoundSwitcher />
      </Tooltip>
      <Tooltip content="开关单词乱序（Ctrl + U）">
        <button
          className={`${randomConfig.isOpen ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            changeRandomState()
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon="random" fixedWidth />
        </button>
      </Tooltip>
      <Tooltip content="开关英语显示（Ctrl + V）">
        <button
          className={`${state?.isWordVisible ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            changeWordVisibleState()
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={state?.isWordVisible ? 'eye' : 'eye-slash'} fixedWidth />
        </button>
      </Tooltip>
      <Tooltip content="开关释意显示（Ctrl + T）">
        <button
          className={`${state?.isTransVisible ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            changeTransVisibleState()
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon="earth-americas" fixedWidth />
        </button>
      </Tooltip>
      <Tooltip content="开关深色模式（Ctrl + D）">
        <button
          className={`text-lg text-indigo-400 focus:outline-none`}
          onClick={(e) => {
            changeDarkModeState()
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={isOpenDarkMode ? 'moon' : 'sun'} fixedWidth />
        </button>
      </Tooltip>
    </div>
  )
}

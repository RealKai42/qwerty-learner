import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SwitcherStateType, SwitcherDispatchType } from '../hooks/useSwitcherState'
import { useHotkeys } from 'react-hotkeys-hook'
import Tooltip from 'components/Tooltip'

export type SwitcherPropsType = {
  state: SwitcherStateType
  dispatch: SwitcherDispatchType
}

const Switcher: React.FC<SwitcherPropsType> = ({ state, dispatch }) => {
  useHotkeys(
    'ctrl+m',
    (e) => {
      e.preventDefault()
      dispatch('sound')
    },
    [dispatch],
  )
  useHotkeys(
    'ctrl+v',
    (e) => {
      e.preventDefault()
      dispatch('wordVisible')
    },
    [dispatch],
  )
  useHotkeys(
    'ctrl+p',
    (e) => {
      e.preventDefault()
      dispatch('phonetic')
    },
    [dispatch],
  )
  useHotkeys(
    'ctrl+u',
    (e) => {
      e.preventDefault()
      dispatch('random')
    },
    [dispatch],
  )
  useHotkeys(
    'ctrl+d',
    (e) => {
      e.preventDefault()
      dispatch('darkMode')
    },
    [dispatch],
  )

  return (
    <div className="flex items-center justify-center space-x-3">
      <Tooltip content="开关单词乱序（Ctrl + U）">
        <button
          className={`${state.random ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('random')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon="random" fixedWidth />
        </button>
      </Tooltip>
      <Tooltip content="开关键盘声音（Ctrl + M）">
        <button
          className={`${state.sound ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('sound')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={state.sound ? 'volume-up' : 'volume-mute'} fixedWidth />
        </button>
      </Tooltip>
      <Tooltip content="开关英语显示（Ctrl + V）">
        <button
          className={`${state.wordVisible ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('wordVisible')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={state.wordVisible ? 'eye' : 'eye-slash'} fixedWidth />
        </button>
      </Tooltip>
      <Tooltip content="开关音标显示（Ctrl + P）">
        <button
          className={`${state.phonetic ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('phonetic')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon="assistive-listening-systems" fixedWidth />
        </button>
      </Tooltip>
      <Tooltip content="开关深色模式（Ctrl + D）">
        <button
          className={`text-indigo-400 text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('darkMode')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={state.darkMode ? 'moon' : 'sun'} fixedWidth />
        </button>
      </Tooltip>
    </div>
  )
}

export default Switcher

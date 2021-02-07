import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SwitcherStateType, SwitcherDispatchType } from '../hooks/useSwitcherState'
import { useHotkeys } from 'react-hotkeys-hook'

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
    'ctrl+n',
    (e) => {
      e.preventDefault()
      dispatch('pronunciation')
    },
    [dispatch],
  )

  return (
    <div className="flex items-center justify-center space-x-3">
      <div className="group relative">
        <button
          className={`${state.sound ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('sound')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={state.sound ? 'volume-up' : 'volume-mute'} fixedWidth />
        </button>
        <div className="invisible group-hover:visible absolute top-full left-1/2 w-40 -ml-20 pt-2 flex items-center justify-center">
          <span className="py-1 px-3 text-gray-500 text-xs">开关声音（Ctrl + M）</span>
        </div>
      </div>
      <div className="group relative">
        <button
          className={`${state.pronunciation ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('pronunciation')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={state.pronunciation ? 'microphone' : 'microphone-slash'} fixedWidth />
        </button>
        <div className="invisible group-hover:visible absolute top-full left-1/2 w-40 -ml-20 pt-2 flex items-center justify-center">
          <span className="py-1 px-3 text-gray-500 text-xs">开关发音（Ctrl + N）</span>
        </div>
      </div>
      <div className="group relative">
        <button
          className={`${state.wordVisible ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('wordVisible')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon={state.wordVisible ? 'eye' : 'eye-slash'} fixedWidth />
        </button>
        <div className="invisible group-hover:visible absolute top-full left-1/2 w-44 -ml-20 pt-2 flex items-center justify-center">
          <span className="py-1 px-3 text-gray-500 text-xs">开关英语显示（Ctrl + V）</span>
        </div>
      </div>
      <div className="group relative">
        <button
          className={`${state.phonetic ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch('phonetic')
            e.currentTarget.blur()
          }}
        >
          <FontAwesomeIcon icon="assistive-listening-systems" fixedWidth />
        </button>
        <div className="invisible group-hover:visible absolute top-full left-1/2 w-44 -ml-20 pt-2 flex items-center justify-center">
          <span className="py-1 px-3 text-gray-500 text-xs">开关音标显示（Ctrl + P）</span>
        </div>
      </div>
    </div>
  )
}

export default Switcher

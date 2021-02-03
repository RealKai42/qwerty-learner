import React, { Dispatch, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { switcherState, switcherActions } from './hooks/useSwitcherState'
import { useSetSoundState } from 'components/AppSettings'
import { useHotkeys } from 'react-hotkeys-hook'

export type SwitcherPropsType = {
  state: switcherState
  dispatch: Dispatch<switcherActions>
}

const Switcher: React.FC<SwitcherPropsType> = ({ state, dispatch }) => {
  const setSound = useSetSoundState()

  useEffect(() => {
    setSound(state.sound)
  }, [state, setSound])

  useHotkeys('ctrl+m', (e) => {
    e.preventDefault()
    dispatch({ type: 'toggleSound' })
  })
  useHotkeys('ctrl+v', (e) => {
    e.preventDefault()
    dispatch({ type: 'toggleWordVisible' })
  })
  useHotkeys('ctrl+p', (e) => {
    e.preventDefault()
    dispatch({ type: 'togglePhonetic' })
  })

  return (
    <div className="flex items-center justify-center space-x-3">
      <div className="group relative">
        <button
          className={`${state.sound ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch({ type: 'sound', state: !state.sound })
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
          className={`${state.wordVisible ? 'text-indigo-400' : 'text-gray-400'} text-lg focus:outline-none`}
          onClick={(e) => {
            dispatch({ type: 'wordVisible', state: !state.wordVisible })
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
            dispatch({ type: 'phonetic', state: !state.phonetic })
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

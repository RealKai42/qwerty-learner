import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSoundState } from 'components/AppSettings'
import { useHotkeys } from 'react-hotkeys-hook'

const Header: React.FC = ({ children }) => {
  const [sound, toggleSound] = useSoundState()
  useHotkeys('shift+m', toggleSound, [sound])
  return (
    <nav className="w-full container mx-auto px-0 py-6">
      <div className="w-full flex items-center justify-between">
        <a className="flex items-center text-indigo-400 no-underline hover:no-underline font-bold text-2xl lg:text-4xl" href="#/">
          <FontAwesomeIcon icon={['far', 'keyboard']} className="h-10 fill-current text-indigo-700 pr-2" />
          Qwerty Learner
        </a>
        <div className="group relative ml-auto">
          <button className="text-indigo-400 text-xl" onClick={toggleSound}>
            <FontAwesomeIcon icon={sound ? 'volume-up' : 'volume-mute'} fixedWidth />
          </button>
          <div className="invisible group-hover:visible absolute top-full left-1/2 w-40 -ml-20 pt-2 flex items-center justify-center">
            <span className="py-1 px-3 text-gray-500 text-xs">开关声音（Shift + M）</span>
          </div>
        </div>
        <div className="flex w-1/2 justify-end content-center items-center space-x-3">{children}</div>
      </div>
    </nav>
  )
}

export default Header

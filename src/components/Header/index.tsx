import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Header: React.FC = () => {
  return (
    <nav className="w-full container mx-auto p-6">
      <div className="w-full flex items-center justify-between">
        <a className="flex items-center text-indigo-400 no-underline hover:no-underline font-bold text-2xl lg:text-4xl" href="#/">
          <FontAwesomeIcon icon={['far', 'keyboard']} className="h-10 fill-current text-indigo-700 pr-2" />
          Qwerty Learner
        </a>
        <div className="flex w-1/2 justify-end content-center">
          <a href="#/" className="px-4 py-2 text-indigo-500 font-bold no-underline ">
            Active
          </a>
          <a href="#/" className="px-4 py-2 text-indigo-400 no-underline ">
            Link
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Header

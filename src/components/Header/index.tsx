import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NavLink } from 'react-router-dom'

const Header: React.FC = ({ children }) => {
  return (
    <nav className="w-full container mx-auto px-10 py-6">
      <div className="w-full flex items-center justify-between">
        <NavLink className="flex items-center text-indigo-400 no-underline hover:no-underline font-bold text-2xl lg:text-4xl" to="/">
          <FontAwesomeIcon icon={['far', 'keyboard']} className="h-10 fill-current text-indigo-700 pr-2" />
          Qwerty Learner
        </NavLink>
        <div className="flex bg-white dark:bg-gray-800 transition-colors duration-300 justify-end content-center items-center space-x-3 card rounded-large w-auto on element p-4">
          {children}
        </div>
      </div>
    </nav>
  )
}

export default Header

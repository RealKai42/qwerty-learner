import React from 'react'
import { NavLink } from 'react-router-dom'
import { ReactComponent as Logo } from '@/assets/logo.svg'

const Header: React.FC = ({ children }) => {
  return (
    <nav className="container mx-auto w-full px-10 py-6">
      <div className="flex w-full flex-col items-center justify-between space-y-3 lg:flex-row lg:space-y-0">
        <NavLink className="flex items-center text-2xl font-bold text-indigo-400 no-underline hover:no-underline lg:text-4xl" to="/">
          <Logo className="mr-3 h-16 w-16" />
          Qwerty Learner
        </NavLink>
        <div className="card on element flex w-auto content-center items-center justify-end space-x-3 rounded-large bg-white p-4 transition-colors duration-300 dark:bg-gray-800">
          {children}
        </div>
      </div>
    </nav>
  )
}

export default Header

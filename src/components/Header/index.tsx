import logo from '@/assets/logo.svg'
import type { PropsWithChildren } from 'react'
import type React from 'react'
import { NavLink } from 'react-router-dom'

const Header: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <header className="container z-20 mx-auto w-full px-4 py-2 sm:px-6 sm:py-3 md:px-10 md:py-4 lg:py-6">
      <div className="flex w-full flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
        <NavLink
          className="flex shrink-0 items-center text-2xl font-bold text-indigo-500 no-underline hover:no-underline lg:text-4xl"
          to="/"
        >
          <img src={logo} className="mr-2 h-10 w-10 sm:mr-3 sm:h-12 sm:w-12 lg:h-16 lg:w-16" alt="Qwerty Learner Logo" />
          <h1>Qwerty Learner</h1>
        </NavLink>
        <nav className="my-card on element flex w-auto max-w-full flex-wrap content-center items-center justify-center gap-x-2 gap-y-1 rounded-xl bg-white p-2 transition-colors duration-300 dark:bg-gray-800 sm:justify-end sm:p-3 md:p-4">
          {children}
        </nav>
      </div>
    </header>
  )
}

export default Header

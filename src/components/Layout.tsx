import React from 'react'
import Footer from './Footer'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex h-screen w-full flex-col items-center pb-4">
    {children}
    <Footer />
  </div>
)

Layout.displayName = 'Layout'

export default Layout

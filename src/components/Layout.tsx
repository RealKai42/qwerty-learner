import React from 'react'
import Footer from './Footer'

const Layout: React.FC<React.PropsWithChildren<LayoutProps>> = ({ children }) => (
  <div className="h-screen w-full pb-4 flex flex-col items-center">
    {children}
    <Footer />
  </div>
)

Layout.displayName = 'Layout'

export default Layout

export type LayoutProps = {}

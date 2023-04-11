import React from 'react'
import Footer from './Footer'

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <body className="flex h-screen w-full flex-col items-center pb-4">
    {children}
    <Footer />
  </body>
)

Layout.displayName = 'Layout'

export default Layout

import Footer from './Footer'
import type React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen w-screen flex-col items-center overflow-hidden pb-4">
      {children}
      {/*<Footer />*/}
    </main>
  )
}

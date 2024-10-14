import type React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="flex h-screen w-full flex-col items-center pb-4">{children}</main>
}

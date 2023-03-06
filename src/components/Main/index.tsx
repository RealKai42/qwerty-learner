import React, { PropsWithChildren } from 'react'

const Main: React.FC<PropsWithChildren> = ({ children }) => {
  return <div className="container mx-auto flex h-full flex-1 flex-col items-center justify-center pb-20">{children}</div>
}

export default Main

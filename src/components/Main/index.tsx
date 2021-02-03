import React from 'react'

const Container: React.FC = ({ children }) => {
  return <div className="container h-full mx-auto pb-20 flex flex-col flex-1 items-center justify-center">{children}</div>
}

export default Container

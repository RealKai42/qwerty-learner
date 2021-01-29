import React from 'react'

const Container: React.FC = ({ children }) => {
  return <div className="container  mx-auto flex flex-col flex-1 items-center justify-center">{children}</div>
}

export default Container

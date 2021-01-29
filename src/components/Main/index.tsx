import React from 'react'

const Container: React.FC = ({ children }) => {
  return <div className="container flex-1 mx-auto flex flex-col items-center  justify-center">{children}</div>
}

export default Container

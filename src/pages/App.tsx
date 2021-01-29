import React from 'react'
import Header from '../components/Header'
import Main from '../components/Main'
import TypingPage from './typingPage'

const App: React.FC = () => {
  return (
    <div className="h-screen pb-14 flex flex-col items-center">
      <Header />
      <Main>
        <TypingPage />
      </Main>
    </div>
  )
}

export default App

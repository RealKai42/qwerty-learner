import React from 'react'
import Header from '../components/Header'
import Main from '../components/Main'
import TypingPage from './typingPage'
import Footer from '../components/Footer'

const App: React.FC = () => {
  return (
    <div className="h-screen pb-4 flex flex-col items-center">
      <Header />
      <Main>
        <TypingPage />
      </Main>
      <Footer />
    </div>
  )
}

export default App

import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './icon'
import 'react-app-polyfill/stable'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GalleryPage from './pages/Gallery'
import TypingPage from './pages/Typing'
import mixpanel from 'mixpanel-browser'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useAtomValue } from 'jotai'
import { isOpenDarkModeAtom } from '@/store'

// mixpanel.init('bdc492847e9340eeebd53cc35f321691')

// for dev
mixpanel.init('5474177127e4767124c123b2d7846e2a')
dayjs.extend(utc)

const container = document.getElementById('root')
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!)

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <Routes>
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/" element={<TypingPage />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  )
}

root.render(<Root />)

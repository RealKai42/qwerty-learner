import Loading from './components/Loading'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import MobilePage from './pages/Mobile'
import TypingPage from './pages/Typing'
import { isOpenDarkModeAtom } from '@/store'
import 'animate.css'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import process from 'process'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))

if (process.env.NODE_ENV === 'production') {
  // for prod
  mixpanel.init('bdc492847e9340eeebd53cc35f321691')
} else {
  // for dev
  mixpanel.init('5474177127e4767124c123b2d7846e2a', { debug: true })
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 600
      if (!isMobile) {
        window.location.href = '/'
      }
      setIsMobile(isMobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            {isMobile ? (
              <Route path="/*" element={<Navigate to="/mobile" />} />
            ) : (
              <>
                <Route index element={<TypingPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/error-book" element={<ErrorBook />} />
                <Route path="/*" element={<Navigate to="/" />} />
              </>
            )}
            <Route path="/mobile" element={<MobilePage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)

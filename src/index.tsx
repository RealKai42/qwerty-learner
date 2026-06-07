import Loading from './components/Loading'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import { FriendLinks } from './pages/FriendLinks'
import MobilePage from './pages/Mobile'
import TypingPage from './pages/Typing'
import { isOpenDarkModeAtom } from '@/store'
import { Analytics } from '@vercel/analytics/react'
import 'animate.css'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import process from 'process'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SWRConfig } from 'swr'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))

if (process.env.NODE_ENV === 'production') {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN_PROD ?? 'bdc492847e9340eeebd53cc35f321691')
} else {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN_DEV ?? '5474177127e4767124c123b2d7846e2a', { debug: true })
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <React.StrictMode>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 60000,
        }}
      >
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
                  <Route path="/friend-links" element={<FriendLinks />} />
                  <Route path="/*" element={<Navigate to="/" />} />
                </>
              )}
              <Route path="/mobile" element={<MobilePage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SWRConfig>
      <Analytics />
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)

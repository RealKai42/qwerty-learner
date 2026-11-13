import Loading from './components/Loading'
import SyncNoticeDialog from './components/SyncNoticeDialog'
import type { SyncNoticeInfo } from './components/SyncNoticeDialog'
import './i18n'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import { Favorites } from './pages/Favorites'
import MobilePage from './pages/Mobile'
import TypingPage from './pages/Typing'
import { useFontApplication } from '@/hooks/useFontApplication'
import { useWebDAVStartupSync } from '@/hooks/useWebDAVStartupSync'
import { isOpenDarkModeAtom, systemDarkModeAtom } from '@/store'
import { Analytics } from '@vercel/analytics/react'
import 'animate.css'
import i18n from 'i18next'
import { useAtomValue, useSetAtom } from 'jotai'
import mixpanel from 'mixpanel-browser'
import React, { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SWRConfig } from 'swr'

const AnalysisPage = lazy(() => import('./pages/Analysis'))
const GalleryPage = lazy(() => import('./pages/Gallery-N'))

class LazyErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center text-gray-500">
          <p>
            {i18n.t('app.pageLoadFailed')}
            <a className="text-indigo-500 underline cursor-pointer" onClick={() => location.reload()}>
              {i18n.t('app.refreshRetry')}
            </a>
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

if (import.meta.env.PROD) {
  if (import.meta.env.VITE_MIXPANEL_TOKEN_PROD) {
    mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN_PROD)
  }
} else {
  if (import.meta.env.VITE_MIXPANEL_TOKEN_DEV) {
    mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN_DEV, { debug: true })
  }
}

function Root() {
  const darkMode = useAtomValue(isOpenDarkModeAtom)
  const setSystemDarkMode = useSetAtom(systemDarkModeAtom)

  const [syncNotice, setSyncNotice] = useState<SyncNoticeInfo | null>(null)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const noticeRef = useRef<SyncNoticeInfo | null>(null)

  const handleSyncNotice = useCallback((notice: SyncNoticeInfo) => {
    noticeRef.current = notice
    setSyncNotice(notice)
    setIsSyncDialogOpen(true)
  }, [])

  const { jumpToLatestChapter } = useWebDAVStartupSync(handleSyncNotice)

  const handleDismissSync = useCallback(() => {
    setIsSyncDialogOpen(false)
  }, [])

  const handleJumpToLatest = useCallback(
    (dictId: string, chapter: number) => {
      jumpToLatestChapter(dictId, chapter)
      setIsSyncDialogOpen(false)
    },
    [jumpToLatestChapter],
  )

  useFontApplication()
  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDarkMode(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [setSystemDarkMode])

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
          <LazyErrorBoundary>
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
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/*" element={<Navigate to="/" />} />
                  </>
                )}
                <Route path="/mobile" element={<MobilePage />} />
              </Routes>
            </Suspense>
          </LazyErrorBoundary>
        </BrowserRouter>
      </SWRConfig>
      <SyncNoticeDialog isOpen={isSyncDialogOpen} notice={syncNotice} onJump={handleJumpToLatest} onDismiss={handleDismissSync} />
      <Analytics />
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)

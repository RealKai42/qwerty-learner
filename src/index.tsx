import Loading from './components/Loading'
import './index.css'
import { ErrorBook } from './pages/ErrorBook'
import { FriendLinks } from './pages/FriendLinks'
import MobilePage from './pages/Mobile'
import TypingPage from './pages/Typing'
import { DARK_MODE_STORAGE_KEY, isOpenDarkModeAtom } from '@/store'
import { Analytics } from '@vercel/analytics/react'
import 'animate.css'
import { useAtom } from 'jotai'
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
  const [darkMode, setDarkMode] = useAtom(isOpenDarkModeAtom)
  useEffect(() => {
    darkMode ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark')
  }, [darkMode])

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // atomWithStorage 只在值被修改时才落盘，所以键不存在就代表用户从未手动
      // 切换过主题，此时跟随系统。写入会产生该键，随后清掉以保持跟随状态；
      // 用户一旦自己切换，键便长期存在，系统主题变化不再覆盖他的选择。
      if (localStorage.getItem(DARK_MODE_STORAGE_KEY) !== null) return

      setDarkMode(e.matches)
      queueMicrotask(() => localStorage.removeItem(DARK_MODE_STORAGE_KEY))
    }

    query.addEventListener('change', handleSystemThemeChange)
    return () => query.removeEventListener('change', handleSystemThemeChange)
  }, [setDarkMode])

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600)

  useEffect(() => {
    // 只更新断点状态。离开 /mobile 由下面的路由声明式处理：
    // 这里一旦做整页跳转，每次拉宽窗口都会重载页面并清空当前练习进度。
    const handleResize = () => setIsMobile(window.innerWidth <= 600)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <React.StrictMode>
      <BrowserRouter basename={REACT_APP_DEPLOY_ENV === 'pages' ? '/qwerty-learner' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            {isMobile ? (
              <>
                <Route path="/mobile" element={<MobilePage />} />
                <Route path="/*" element={<Navigate to="/mobile" />} />
              </>
            ) : (
              <>
                <Route index element={<TypingPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/error-book" element={<ErrorBook />} />
                <Route path="/friend-links" element={<FriendLinks />} />
                {/* /mobile 也会落到这里，拉宽窗口后自动回到桌面版路由 */}
                <Route path="/*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
    </React.StrictMode>
  )
}

const container = document.getElementById('root')

container && createRoot(container).render(<Root />)

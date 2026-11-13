import { test as base, expect } from '@playwright/test'

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    // Exercise this checkout without depending on pronunciation or analytics services.
    await page.route('**/*', (route) => {
      if (new URL(route.request().url()).origin === new URL(baseURL!).origin) return route.continue()
      return route.abort()
    })
    await page.addInitScript(() => {
      localStorage.setItem('i18nextLng', 'zh')
      localStorage.setItem('dismissStartCardDate', JSON.stringify(new Date().toISOString()))
      localStorage.setItem('pronunciation', JSON.stringify({ isOpen: false }))
      localStorage.setItem('keySoundsConfig', JSON.stringify({ isOpen: false }))
      localStorage.setItem('hintSoundsConfig', JSON.stringify({ isOpen: false }))
    })
    await use(page)
  },
})

export { expect }

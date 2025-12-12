// Import static translation resources
import en from '@/locales/en/translation.json'
import zh from '@/locales/zh/translation.json'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const savedLang = localStorage.getItem('i18n_lang') || ''
const browserLang = (navigator.language || 'en').toLowerCase().startsWith('zh') ? 'zh' : 'en'
const defaultLang = savedLang || browserLang

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n




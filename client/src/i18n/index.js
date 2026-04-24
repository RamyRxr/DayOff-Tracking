import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr.json'
import en from './en.json'
import ar from './ar.json'

// Get saved language or default to French
const savedLang = localStorage.getItem('lang') || 'fr'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  })

// Set document direction for RTL languages
if (savedLang === 'ar') {
  document.documentElement.dir = 'rtl'
  document.documentElement.lang = 'ar'
} else {
  document.documentElement.dir = 'ltr'
  document.documentElement.lang = savedLang
}

export default i18n

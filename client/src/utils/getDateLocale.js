import { fr, enUS, arDZ } from 'date-fns/locale'
import i18n from '../i18n'

// Get date-fns locale based on current i18n language
export const getDateLocale = () => {
  const currentLang = i18n.language || 'fr'

  const localeMap = {
    'fr': fr,
    'en': enUS,
    'ar': arDZ
  }

  return localeMap[currentLang] || fr
}

// Get day names in current language (short form for calendar headers)
export const getDayNames = () => {
  const currentLang = i18n.language || 'fr'

  const dayNamesMap = {
    'fr': ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    'en': ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    'ar': ['ن', 'ث', 'ر', 'خ', 'ج', 'س', 'ح']
  }

  return dayNamesMap[currentLang] || dayNamesMap['fr']
}

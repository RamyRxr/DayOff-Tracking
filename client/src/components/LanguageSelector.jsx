import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇩🇿' },
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0]

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)

    // Set document direction and lang attribute
    if (code === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = code
    }

    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors"
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-ambient border border-black/6 dark:border-white/[0.08] overflow-hidden animate-in">
          <div className="p-2 space-y-1">
            {languages.map((lang) => {
              const isActive = lang.code === i18n.language
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-warm-gray-200 dark:bg-[#3A3A3C]'
                      : 'hover:bg-warm-gray-200 dark:hover:bg-[#48484A]'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white">
                    {lang.label}
                  </span>
                  {isActive && (
                    <Check className="w-4 h-4 text-navy dark:text-blue-400" strokeWidth={2.5} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

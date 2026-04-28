import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇩🇿' },
]

export default function LanguageSelector() {
  const { i18n } = useTranslation()
  const { isDark } = useTheme()
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

  // Update document direction when language changes
  useEffect(() => {
    const currentLang = i18n.language
    if (currentLang === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = currentLang
    }
  }, [i18n.language])

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
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
        <span className="text-xs font-medium text-gray-600 dark:text-[#7A9CC4]">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-[#7A9CC4] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-2xl overflow-hidden animate-in"
          style={isDark ? {
            backgroundColor: '#1C1C28',
            border: '1px solid rgba(99,157,255,0.15)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
          } : {
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)'
          }}
        >
          <div className="p-2 space-y-1">
            {languages.map((lang) => {
              const isActive = lang.code === i18n.language
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg transition-all"
                  style={isActive ? (isDark ? {
                    backgroundColor: 'rgba(99,157,255,0.12)'
                  } : {
                    backgroundColor: 'rgba(0,122,255,0.1)'
                  }) : {}}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = isDark ? 'rgba(99,157,255,0.08)' : 'rgba(0,0,0,0.04)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1 text-left text-sm font-medium"
                    style={{ color: isDark ? '#E8EFF8' : '#111827' }}
                  >
                    {lang.label}
                  </span>
                  {isActive && (
                    <Check className="w-4 h-4" style={{ color: isDark ? '#639DFF' : '#007AFF' }} strokeWidth={2.5} />
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

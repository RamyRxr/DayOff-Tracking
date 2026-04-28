import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function CustomSelect({ options, value, onChange, placeholder = 'Sélectionner...', label, required = false, onOpen }) {
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
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

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <>
      <style>{`
        @keyframes dropdownOpen {
          0% {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <div className="relative" ref={dropdownRef}>
        {label && (
        <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
          {label}
          {required && <span className="text-status-red dark:text-[#FF6B6B] ml-1">*</span>}
        </label>
      )}

      {/* Selected Display / Trigger */}
      <button
        type="button"
        onClick={() => {
          const newOpenState = !isOpen
          setIsOpen(newOpenState)
          if (newOpenState && onOpen) {
            onOpen()
          }
        }}
        className="w-full px-4 py-3 bg-warm-gray-200 rounded-xl text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all border border-transparent"
        style={isDark ? {
          backgroundColor: 'rgba(13,21,38,0.75)',
          borderColor: 'rgba(99,157,255,0.12)',
          border: '1px solid'
        } : {}}
      >
        {selectedOption ? (
          <>
            <div className="flex-1 text-[#111827] dark:text-[#E8EFF8] font-medium">{selectedOption.label}</div>
            <ChevronDown className={`w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        ) : (
          <>
            <div className="flex-1 text-[#6B7280] dark:text-[#7A9CC4]">{placeholder}</div>
            <ChevronDown className={`w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-black/6 shadow-ambient overflow-hidden z-50"
          style={isDark ? {
            animation: 'dropdownOpen 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            backgroundColor: '#0F1A2E',
            border: '1px solid rgba(99,157,255,0.15)',
            boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 16px 48px rgba(0,0,0,0.6)'
          } : {
            animation: 'dropdownOpen 150ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {options.map((option) => {
              const isSelected = value === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 text-left ${
                    isSelected
                      ? 'bg-warm-gray-200 shadow-sm'
                      : 'hover:bg-warm-gray-200'
                  }`}
                  style={isDark ? (
                    isSelected
                      ? {
                          backgroundColor: 'rgba(99,157,255,0.12)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)'
                        }
                      : {}
                  ) : {}}
                  onMouseEnter={(e) => {
                    if (isDark && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.06)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isDark && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#111827] dark:text-[#E8EFF8]">{option.label}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-navy dark:text-[#639DFF] flex-shrink-0" strokeWidth={2.5} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
      </div>
    </>
  )
}

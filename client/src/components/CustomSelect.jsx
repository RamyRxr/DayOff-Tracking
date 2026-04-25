import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useDarkMode } from '../hooks/useDarkMode'

export default function CustomSelect({ options, value, onChange, placeholder = 'Sélectionner...', label, required = false, onOpen }) {
  const { isDark } = useDarkMode()
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
        <label className="block text-sm font-medium text-[#111827] dark:text-[#F2F2F7] mb-2">
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
        className="w-full px-4 py-3 bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-navy/20 dark:focus:ring-[#2C4A6F]/20 transition-all border border-transparent dark:border-white/[0.07]"
      >
        {selectedOption ? (
          <>
            <div className="flex-1 text-[#111827] dark:text-[#F2F2F7] font-medium">{selectedOption.label}</div>
            <ChevronDown className={`w-5 h-5 text-[#6B7280] dark:text-[#8E8E93] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        ) : (
          <>
            <div className="flex-1 text-[#6B7280] dark:text-[#48484A]">{placeholder}</div>
            <ChevronDown className={`w-5 h-5 text-[#6B7280] dark:text-[#8E8E93] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C1C28] rounded-xl border border-black/6 dark:border-white/[0.07] shadow-ambient overflow-hidden z-10"
          style={isDark ? {
            animation: 'dropdownOpen 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4)'
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
                      ? 'bg-warm-gray-200 dark:bg-white/[0.08] shadow-sm'
                      : 'hover:bg-warm-gray-200 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#111827] dark:text-[#F2F2F7]">{option.label}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-navy dark:text-[#5E9FFF] flex-shrink-0" strokeWidth={2.5} />
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

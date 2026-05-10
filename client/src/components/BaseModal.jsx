import { X } from 'lucide-react'
import { useDarkHoverStyle } from '../hooks/useDarkMode'

/**
 * Base modal wrapper component with consistent styling
 * Provides header, scrollable body, and footer structure
 */
export default function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  headerIcon,
  headerBgColor = 'bg-white',
  headerTextColor = 'text-[#111827]',
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[88vh]',
  children,
  footer,
  isDark = false
}) {
  const closeButtonHover = useDarkHoverStyle(isDark)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in flex items-center justify-center p-6"
        style={isDark ? { backgroundColor: 'rgba(0,0,0,0.6)' } : {}}
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          className={`bg-white rounded-2xl w-full ${maxWidth} flex flex-col h-[92vh] sm:${maxHeight} overflow-hidden animate-scale-in`}
          style={
            isDark
              ? {
                  backgroundColor: '#0B1120',
                  border: '1px solid rgba(99,157,255,0.15)',
                  boxShadow: '0 0 0 1px rgba(99,157,255,0.1), 0 32px 80px rgba(0,0,0,0.7)'
                }
              : {
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
                }
          }
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`flex-shrink-0 ${headerBgColor} border-b border-gray-100 px-5 py-4 flex items-center justify-between`}
            style={
              isDark
                ? {
                    backgroundColor: '#0B1120',
                    borderColor: 'rgba(99,157,255,0.12)'
                  }
                : {}
            }
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {headerIcon && (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={
                    isDark
                      ? {
                          backgroundColor: 'rgba(99,157,255,0.12)',
                          border: '1px solid rgba(99,157,255,0.2)'
                        }
                      : { backgroundColor: headerBgColor }
                  }
                >
                  {headerIcon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2
                  className={`font-display text-xl font-bold ${headerTextColor} dark:text-[#E8EFF8] truncate`}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-[#6B7280] dark:text-[#7A9CC4] mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg hover:bg-black/5 active:scale-95 flex items-center justify-center transition-all duration-200 flex-shrink-0"
              {...closeButtonHover}
            >
              <X className="w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4]" />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {children}
            {/* Bottom padding for scroll clearance */}
            <div className="h-2" />
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4"
              style={
                isDark
                  ? {
                      backgroundColor: '#0B1120',
                      borderColor: 'rgba(99,157,255,0.12)'
                    }
                  : {}
              }
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

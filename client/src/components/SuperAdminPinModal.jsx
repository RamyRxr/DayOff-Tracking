import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Lock, AlertCircle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useDarkHoverStyle } from '../hooks/useDarkMode'

const SUPERADMIN_PIN = '0147'

export default function SuperAdminPinModal({ isOpen, onClose, onSuccess, title }) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const closeButtonHover = useDarkHoverStyle(isDark)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (pin === SUPERADMIN_PIN) {
      setError('')
      setPin('')
      onSuccess()
    } else {
      setError(t('codeSuperadminIncorrect'))
      setPin('')
    }
  }

  const handleClose = () => {
    setPin('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      style={isDark ? { backgroundColor: 'rgba(0,0,0,0.6)' } : {}}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
        style={isDark ? {
          backgroundColor: '#0B1120',
          border: '1px solid rgba(99,157,255,0.15)',
          boxShadow: '0 0 0 1px rgba(99,157,255,0.1), 0 32px 80px rgba(0,0,0,0.7)'
        } : {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="bg-red-50 border-b border-red-100 px-5 py-4 flex items-center justify-between"
          style={isDark ? {
            backgroundColor: 'rgba(192,57,43,0.1)',
            borderColor: 'rgba(255,59,48,0.2)'
          } : {}}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center"
              style={isDark ? {
                backgroundColor: 'rgba(192,57,43,0.15)',
                border: '1px solid rgba(255,59,48,0.3)'
              } : {}}
            >
              <Lock className="w-6 h-6 text-red-600 dark:text-[#FF6B6B]" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-red-900 dark:text-[#FF6B6B]">
                {title || t('verificationSuperadmin')}
              </h2>
              <p className="text-sm text-red-700 dark:text-[#FF6B6B]/80 mt-0.5">
                {t('entrezCodeDeveloppeur')}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-lg hover:bg-black/5 flex items-center justify-center transition-all"
            {...closeButtonHover}
          >
            <X className="w-5 h-5 text-red-600 dark:text-[#FF6B6B]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl"
              style={isDark ? {
                backgroundColor: 'rgba(192,57,43,0.1)',
                borderColor: 'rgba(255,59,48,0.2)'
              } : {}}
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-[#FF6B6B] flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-[#FF6B6B]">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#7A9CC4] mb-2">
              {t('codeSuperadmin')}
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="••••"
              autoFocus
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 dark:border-[rgba(99,157,255,0.2)] rounded-xl bg-white dark:bg-[rgba(99,157,255,0.05)] text-gray-900 dark:text-[#E8EFF8] focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-[#FF6B6B] transition-all"
              style={isDark ? {
                backgroundColor: 'rgba(99,157,255,0.05)',
                borderColor: 'rgba(99,157,255,0.2)'
              } : {}}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-gray-700 dark:text-[#7A9CC4] border border-gray-300 dark:border-[rgba(99,157,255,0.2)] hover:bg-gray-50 dark:hover:bg-[rgba(99,157,255,0.08)] transition-all"
            >
              {t('annuler')}
            </button>
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={isDark ? {
                backgroundColor: '#C0392B',
                opacity: pin.length !== 4 ? 0.5 : 1
              } : {}}
            >
              {t('verifier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

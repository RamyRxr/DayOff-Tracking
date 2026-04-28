import { useState, useRef, useEffect } from 'react'
import { Lock, Loader2, AlertCircle, Check, ChevronDown, Sun, Moon } from 'lucide-react'
import { useAdmins, useAdminPin } from '../hooks/useAdmins'
import { useDarkMode } from '../hooks/useDarkMode'

export default function LoginPage({ onLoginSuccess }) {
  const { isDark, toggle: toggleDarkMode } = useDarkMode()
  const { admins, loading: adminsLoading } = useAdmins()
  const { verify, verifying, error } = useAdminPin()
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [pin, setPin] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedAdminId || pin.length !== 4) {
      return
    }

    try {
      const admin = await verify(selectedAdminId, pin)
      onLoginSuccess(admin)
    } catch {
      // Error is handled by hook
      setPin('')
    }
  }

  const handlePinInput = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(value)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const selectedAdmin = admins.find((a) => a.id === selectedAdminId)

  const getAdminInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div
      className="min-h-screen bg-warm-gray-200 dark:bg-gray-950 flex items-center justify-center p-4"
      style={isDark ? {
        backgroundColor: '#080C14'
      } : {}}
    >
      {/* Dark/Light Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
          style={isDark ? {
            backgroundColor: 'rgba(13,21,38,0.9)',
            borderColor: 'rgba(99,157,255,0.2)'
          } : {}}
          title={isDark ? 'Mode clair' : 'Mode sombre'}
        >
          {isDark ? (
            <Sun size={16} className="text-amber-500" />
          ) : (
            <Moon size={16} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Login Card */}
      <div
        className="bg-white/95 dark:bg-gray-900 dark:border dark:border-gray-800 backdrop-blur-2xl rounded-3xl shadow-modal w-full max-w-md p-8"
        style={isDark ? {
          backgroundColor: '#0B1120',
          border: '1px solid rgba(99,157,255,0.15)',
          boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 24px 64px rgba(0,0,0,0.6)'
        } : {}}
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full bg-navy/10 dark:bg-[rgba(99,157,255,0.15)] flex items-center justify-center mx-auto mb-4"
          >
            <Lock className="w-8 h-8 text-navy dark:text-[#639DFF]" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-[#E8EFF8]">
            DayOff Tracking
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#7A9CC4] mt-1">NAFTAL - Connexion Admin</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Selection - Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
              {t('administrateur')}
            </label>
            {adminsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-navy dark:text-[#639DFF] animate-spin" />
              </div>
            ) : (
              <>
                {/* Selected Admin Display / Trigger */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-3 bg-warm-gray-200 dark:bg-[rgba(13,21,38,0.75)] rounded-xl text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-navy/20 dark:focus:ring-[rgba(99,157,255,0.3)] transition-all border border-transparent dark:border-[rgba(99,157,255,0.12)]"
                >
                  {selectedAdmin ? (
                    <>
                      <div
                        className="w-10 h-10 rounded-full bg-warm-gray-200 dark:bg-[rgba(99,157,255,0.15)] flex items-center justify-center text-sm font-semibold text-[#374151] dark:text-[#7A9CC4]"
                      >
                        {getAdminInitials(selectedAdmin.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#111827] dark:text-[#E8EFF8]">{selectedAdmin.name}</div>
                        <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{selectedAdmin.role}</div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <>
                      <div className="flex-1 text-[#6B7280] dark:text-[#7A9CC4]">Sélectionner un admin</div>
                      <ChevronDown className={`w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* Dropdown Panel */}
                {dropdownOpen && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-[#0F1A2E] backdrop-blur-xl rounded-xl border border-black/6 dark:border-[rgba(99,157,255,0.15)] shadow-ambient overflow-hidden z-10 animate-in"
                    style={isDark ? {
                      boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 16px 48px rgba(0,0,0,0.6)'
                    } : {}}
                  >
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                      {admins.map((admin) => {
                        const isSelected = selectedAdmin?.id === admin.id
                        return (
                          <button
                            key={admin.id}
                            type="button"
                            onClick={() => {
                              setSelectedAdminId(admin.id)
                              setDropdownOpen(false)
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                              isSelected
                                ? 'bg-white dark:bg-[rgba(99,157,255,0.12)] shadow-ambient border-0.5 border-navy dark:border-[rgba(99,157,255,0.3)]'
                                : 'bg-warm-gray-200 dark:bg-[rgba(99,157,255,0.06)] hover:bg-white/50 dark:hover:bg-[rgba(99,157,255,0.1)] hover:shadow-sm'
                            }`}
                          >
                            <div
                              className="w-10 h-10 rounded-full bg-warm-gray-200 dark:bg-[rgba(99,157,255,0.15)] flex items-center justify-center text-sm font-semibold text-[#374151] dark:text-[#7A9CC4]"
                            >
                              {getAdminInitials(admin.name)}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-semibold text-[#111827] dark:text-[#E8EFF8]">{admin.name}</div>
                              <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{admin.role}</div>
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
              </>
            )}
          </div>

          {/* PIN Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-[#E8EFF8] mb-2">
              {t('codePIN4Chiffres')}
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={handlePinInput}
              placeholder="••••"
              required
              maxLength={4}
              className="w-full px-4 py-3 bg-warm-gray-200 dark:bg-[rgba(13,21,38,0.75)] rounded-xl text-gray-900 dark:text-[#E8EFF8] text-center text-2xl font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-navy/20 dark:focus:ring-[rgba(99,157,255,0.3)] transition-all border border-transparent dark:border-[rgba(99,157,255,0.12)]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 bg-apple-red/10 dark:bg-[rgba(192,57,43,0.15)] border border-apple-red/20 dark:border-[rgba(255,59,48,0.2)] rounded-xl"
            >
              <AlertCircle className="w-5 h-5 text-apple-red dark:text-[#FF6B6B] flex-shrink-0" />
              <p className="text-sm text-apple-red dark:text-[#FF6B6B]">
                {t('codePINIncorrect')}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedAdminId || pin.length !== 4 || verifying}
            className="w-full bg-navy dark:bg-transparent text-white px-4 py-3 rounded-xl font-medium shadow-ambient hover:shadow-modal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={isDark && !(!selectedAdminId || pin.length !== 4 || verifying) ? {
              background: 'linear-gradient(145deg, #2A5494, #1E3D6B)',
              border: '1px solid rgba(99,157,255,0.2)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.5)'
            } : (isDark ? {
              backgroundColor: 'rgba(99,157,255,0.15)',
              color: '#7A9CC4'
            } : {})}
          >
            {verifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('verification')}
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 dark:text-[#7A9CC4]">
            {t('codePINParDefaut')}
          </p>
        </div>
      </div>
    </div>
  )
}

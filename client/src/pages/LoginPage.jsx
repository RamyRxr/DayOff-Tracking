import { useState, useRef, useEffect } from 'react'
import { Lock, Loader2, AlertCircle, Check, ChevronDown } from 'lucide-react'
import { useAdmins, useAdminPin } from '../hooks/useAdmins'

export default function LoginPage({ onLoginSuccess }) {
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
      const admin = await verify(parseInt(selectedAdminId), pin)
      onLoginSuccess(admin)
    } catch (err) {
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

  const selectedAdmin = admins.find((a) => a.id === parseInt(selectedAdminId))

  const getAdminInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="min-h-screen bg-warm-gray-200 flex items-center justify-center p-4">
      {/* Login Card */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-modal w-full max-w-md p-8">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-navy" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            DayOff Tracking
          </h1>
          <p className="text-sm text-gray-600 mt-1">NAFTAL - Connexion Admin</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Selection - Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-[#111827] mb-2">
              Administrateur
            </label>
            {adminsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-navy animate-spin" />
              </div>
            ) : (
              <>
                {/* Selected Admin Display / Trigger */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-3 bg-warm-gray-200 rounded-xl text-left flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
                >
                  {selectedAdmin ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151]">
                        {getAdminInitials(selectedAdmin.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#111827]">{selectedAdmin.name}</div>
                        <div className="text-xs text-[#6B7280]">{selectedAdmin.role}</div>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-[#6B7280] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  ) : (
                    <>
                      <div className="flex-1 text-[#6B7280]">Sélectionner un admin</div>
                      <ChevronDown className={`w-5 h-5 text-[#6B7280] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {/* Dropdown Panel */}
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-xl border border-black/6 shadow-ambient overflow-hidden z-10 animate-in">
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                      {admins.map((admin) => {
                        const isSelected = selectedAdmin?.id === admin.id
                        return (
                          <button
                            key={admin.id}
                            type="button"
                            onClick={() => {
                              setSelectedAdminId(admin.id.toString())
                              setDropdownOpen(false)
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 ${
                              isSelected
                                ? 'bg-white shadow-ambient border-0.5 border-navy'
                                : 'bg-warm-gray-200 hover:bg-white/50 hover:shadow-sm'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151]">
                              {getAdminInitials(admin.name)}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-semibold text-[#111827]">{admin.name}</div>
                              <div className="text-xs text-[#6B7280]">{admin.role}</div>
                            </div>
                            {isSelected && (
                              <Check className="w-5 h-5 text-navy flex-shrink-0" strokeWidth={2.5} />
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
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Code PIN (4 chiffres)
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
              className="w-full px-4 py-3 bg-warm-gray-200 rounded-xl text-gray-900 text-center text-2xl font-semibold tracking-widest focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-apple-red/10 border border-apple-red/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-apple-red flex-shrink-0" />
              <p className="text-sm text-apple-red">
                Code PIN incorrect. Veuillez réessayer.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedAdminId || pin.length !== 4 || verifying}
            className="w-full bg-navy text-white px-4 py-3 rounded-xl font-medium shadow-ambient hover:shadow-modal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Vérification...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Code PIN par défaut pour Mohammed Saïd : 1234
          </p>
        </div>
      </div>
    </div>
  )
}

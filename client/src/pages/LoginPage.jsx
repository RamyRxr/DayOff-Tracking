import { useState } from 'react'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { useAdmins, useAdminPin } from '../hooks/useAdmins'

export default function LoginPage({ onLoginSuccess }) {
  const { admins, loading: adminsLoading } = useAdmins()
  const { verify, verifying, error } = useAdminPin()
  const [selectedAdminId, setSelectedAdminId] = useState('')
  const [pin, setPin] = useState('')

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
          {/* Admin Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Administrateur
            </label>
            {adminsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-navy animate-spin" />
              </div>
            ) : (
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-warm-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
              >
                <option value="">Sélectionner un admin</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} - {admin.role}
                  </option>
                ))}
              </select>
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

import { Check } from 'lucide-react'

export default function AutorisationStep({
  admins,
  selectedAdmin,
  onAdminSelect,
  pin,
  onPinChange,
  pinStatus,
  pinIdPrefix = 'pin'
}) {
  const getPinBoxClass = (index) => {
    const hasValue = pin[index] !== ''

    // VERIFIED state (all 4 boxes)
    if (pinStatus === 'verified') {
      return 'pin-verified'
    }

    // ERROR state (all 4 boxes)
    if (pinStatus === 'error') {
      return 'pin-error'
    }

    // FILLED (has digit, not focused)
    if (hasValue) {
      return 'pin-filled'
    }

    // EMPTY unfocused (default)
    return 'pin-empty'
  }

  return (
    <>
      {/* Admin Selector */}
      <div>
        <label className="block text-sm font-medium text-[#111827] mb-3">
          Administrateur
        </label>
        <div className="space-y-2">
          {admins.map(admin => (
            <button
              key={admin.id}
              onClick={() => onAdminSelect(admin)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedAdmin?.id === admin.id
                  ? 'border-navy bg-navy/5'
                  : 'border-warm-gray-400 hover:border-navy/40'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-semibold text-navy">
                {admin.initials}
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-[#111827]">{admin.name}</div>
                <div className="text-xs text-[#6B7280]">{admin.role}</div>
              </div>
              {selectedAdmin?.id === admin.id && (
                <Check className="w-5 h-5 text-navy" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* PIN Input */}
      <div>
        <label className="block text-sm font-medium text-[#111827] mb-3">
          Code PIN
        </label>
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map(index => (
            <input
              key={index}
              id={`${pinIdPrefix}-${index}`}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={pin[index]}
              onChange={(e) => onPinChange(index, e.target.value)}
              disabled={pinStatus === 'verifying' || pinStatus === 'verified'}
              className={`w-14 h-14 text-center text-xl font-semibold rounded-xl focus:outline-none ${getPinBoxClass(index)}`}
            />
          ))}
        </div>
        {pinStatus === 'verifying' && (
          <p className="text-[12px] text-navy text-center mt-2">Vérification...</p>
        )}
        {pinStatus === 'error' && (
          <p className="text-[12px] text-status-red text-center mt-2">Code incorrect</p>
        )}
        {pinStatus === 'verified' && (
          <p className="text-[12px] text-status-green text-center mt-2">✓ Code correct</p>
        )}
      </div>
    </>
  )
}

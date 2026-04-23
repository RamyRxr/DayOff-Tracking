import { useState } from 'react'
import { X, ShieldAlert, AlertTriangle, ChevronLeft, Check } from 'lucide-react'

export default function BlockEmployeeModal({ employee, isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle')

  if (!isOpen || !employee) return null

  const handleClose = () => {
    setStep(1)
    setReason('')
    setDescription('')
    setSelectedAdmin(null)
    setPin(['', '', '', ''])
    setPinStatus('idle')
    onClose?.()
  }

  const admins = [
    { id: 1, name: 'Ahmed Benali', role: 'Responsable RH', initials: 'AB' },
    { id: 2, name: 'Fatima Meziane', role: 'Directeur Admin', initials: 'FM' },
  ]

  // Calculate working days elapsed
  const currentDate = new Date()
  const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 20)
  let workingDaysElapsed = 0
  const tempDate = new Date(periodStart)
  while (tempDate <= currentDate) {
    const day = tempDate.getDay()
    if (day !== 5 && day !== 6) workingDaysElapsed++
    tempDate.setDate(tempDate.getDate() + 1)
  }

  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1]
    if (value && !/^[0-9]$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      document.getElementById(`block-pin-${index + 1}`)?.focus()
    }

    if (newPin.every(d => d !== '')) {
      handlePinValidate(newPin.join(''))
    }
  }

  const handlePinValidate = async (pinValue) => {
    setPinStatus('verifying')
    await new Promise(resolve => setTimeout(resolve, 800))

    if (pinValue === '1234') {
      setPinStatus('verified')
    } else {
      setPinStatus('error')
      setTimeout(() => {
        setPin(['', '', '', ''])
        setPinStatus('idle')
        document.getElementById('block-pin-0')?.focus()
      }, 1500)
    }
  }

  const handleSubmit = () => {
    onSubmit?.({
      employeeId: employee.id,
      reason,
      description: description.trim(),
      daysUsed: employee.daysUsed,
      daysRemaining: employee.daysTotal - employee.daysUsed,
    })
    handleClose()
  }

  const isStep1Valid = reason !== ''
  const isStep2Valid = pinStatus === 'verified'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-modal w-[480px] max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-status-red/10 border-b border-status-red/20 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-status-red/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-status-red" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827]">
                {step === 1 ? 'Bloquer l\'employé' : 'Autorisation requise'}
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Étape {step} sur 2
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 pb-8">
          {/* Employee info */}
          <div className="bg-warm-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151]">
                {employee.avatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#111827] text-base">
                  {employee.name}
                </div>
                <div className="text-xs font-mono text-[#6B7280]">
                  {employee.matricule}
                </div>
              </div>
            </div>

            {/* 2-column info row */}
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-black/6">
              <div>
                <div className="text-xs text-[#6B7280]">Jours de congé pris</div>
                <div className="text-lg font-bold text-[#111827] mt-0.5">
                  {employee.daysUsed}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280]">Jours travaillés</div>
                <div className="text-lg font-bold text-[#111827] mt-0.5">
                  {workingDaysElapsed}
                </div>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Warning message */}
              <div className="flex gap-3 p-4 bg-status-amber/10 border border-status-amber/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-status-amber flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-status-amber text-sm">
                    Minimum de jours ouvrables non respecté
                  </div>
                  <p className="text-xs text-[#374151] mt-1">
                    L'employé a utilisé trop de jours de congé. Le minimum requis est de 16 jours
                    ouvrables par période.
                  </p>
                </div>
              </div>

              {/* Reason selector */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Motif du blocage
                  <span className="text-status-red ml-1">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
                >
                  <option value="">Sélectionnez un motif</option>
                  <option value="Absences non justifiées">Absences non justifiées</option>
                  <option value="Dépassement du quota de congés">Dépassement du quota de congés</option>
                  <option value="Non-respect des procédures">Non-respect des procédures</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Description
                  <span className="text-[#6B7280] font-normal ml-1">(optionnel)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails supplémentaires..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
                />
              </div>

              {/* Impact notice */}
              <div className="bg-warm-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-[#111827] mb-2">
                  Conséquences du blocage
                </h4>
                <ul className="space-y-1.5 text-xs text-[#374151]">
                  <li className="flex gap-2">
                    <span className="text-status-red">•</span>
                    <span>L'employé ne pourra plus demander de congés</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-red">•</span>
                    <span>Son statut sera marqué comme "Bloqué"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-red">•</span>
                    <span>Un admin RH pourra le débloquer manuellement</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
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
                      onClick={() => setSelectedAdmin(admin)}
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
                      id={`block-pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={pin[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      disabled={pinStatus === 'verifying' || pinStatus === 'verified'}
                      className={`w-14 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all shadow-inner focus:outline-none ${
                        pinStatus === 'error'
                          ? 'border-status-red bg-status-red/5'
                          : pinStatus === 'verified'
                          ? 'border-status-green bg-status-green/5'
                          : pin[index]
                          ? 'border-navy bg-warm-gray-200'
                          : 'border-transparent bg-warm-gray-200 focus:border-navy'
                      }`}
                    />
                  ))}
                </div>
                {pinStatus === 'verifying' && (
                  <p className="text-xs text-navy text-center mt-2">Vérification...</p>
                )}
                {pinStatus === 'error' && (
                  <p className="text-xs text-status-red text-center mt-2">Code incorrect</p>
                )}
                {pinStatus === 'verified' && (
                  <p className="text-xs text-status-green text-center mt-2">✓ Code correct</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-black/6 px-6 py-4 flex gap-3 rounded-b-3xl">
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all duration-200"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex-1 bg-status-red text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? 'Suivant →' : 'Confirmer le blocage'}
          </button>
        </div>
      </div>
    </div>
  )
}

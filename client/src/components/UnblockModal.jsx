import { useState, useEffect, useRef } from 'react'
import { X, Unlock, CheckCircle2, ChevronLeft, Check } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import CustomSelect from './CustomSelect'

export default function UnblockModal({ employee, activeBlock, isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1)
  const [unblockReason, setUnblockReason] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle')
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const sentinelRef = useRef(null)

  if (!isOpen || !employee) return null

  // IntersectionObserver for footer visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasScrolledToBottom(true)
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [])

  const handleClose = () => {
    setStep(1)
    setUnblockReason('')
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

  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1]
    if (value && !/^[0-9]$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      document.getElementById(`unblock-pin-${index + 1}`)?.focus()
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
        document.getElementById('unblock-pin-0')?.focus()
      }, 1500)
    }
  }

  const handleSubmit = () => {
    onSubmit?.({
      blockId: activeBlock?.id,
      employeeId: employee.id,
      reason: unblockReason,
      description: description.trim(),
    })
    handleClose()
  }

  const isStep1Valid = unblockReason !== ''
  const isStep2Valid = pinStatus === 'verified'

  const getBlockDate = () => {
    if (!activeBlock?.createdAt) return '—'
    try {
      return format(new Date(activeBlock.createdAt), 'dd MMM yyyy', { locale: fr })
    } catch {
      return '—'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col h-[92vh] sm:max-h-[88vh] overflow-hidden"
        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)' }}
      >
        {/* STICKY HEADER */}
        <div className="flex-shrink-0 bg-status-green/10 px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-status-green/20 flex items-center justify-center">
              <Unlock className="w-5 h-5 text-status-green" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827]">
                {step === 1 ? 'Débloquer l\'Employé' : 'Autorisation requise'}
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

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
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
          </div>

          {step === 1 ? (
            <>
              {/* Block summary card */}
              <div className="bg-warm-gray-200 rounded-xl p-4 shadow-inner">
                <h4 className="text-sm font-semibold text-[#111827] mb-3">
                  Informations du blocage
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Motif du blocage</span>
                    <span className="text-[#111827] font-medium">
                      {activeBlock?.reason || 'Non spécifié'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Date de blocage</span>
                    <span className="text-[#111827] font-medium">
                      {getBlockDate()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Bloqué par</span>
                    <span className="text-[#111827] font-medium">
                      {activeBlock?.adminName || 'Admin RH'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Unblock reason dropdown */}
              <CustomSelect
                label="Motif du déblocage"
                required
                value={unblockReason}
                onChange={(value) => setUnblockReason(value)}
                placeholder="Sélectionnez un motif"
                options={[
                  { value: 'Erreur administrative', label: 'Erreur administrative' },
                  { value: 'Justification acceptée', label: 'Justification acceptée' },
                  { value: 'Décision hiérarchique', label: 'Décision hiérarchique' },
                  { value: 'Autre', label: 'Autre' },
                ]}
              />

              {/* Description field */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Description
                  <span className="text-[#6B7280] font-normal ml-1">(optionnel)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Remarques sur le déblocage..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-status-green/20 focus:border-status-green transition-all"
                />
              </div>

              {/* Success notice */}
              <div className="flex gap-3 p-4 bg-status-green/10 border border-status-green/20 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-status-green flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-status-green text-sm">
                    Déblocage immédiat
                  </div>
                  <p className="text-xs text-[#374151] mt-1">
                    Après confirmation, l'employé pourra immédiatement demander de
                    nouveaux congés et son statut sera mis à jour.
                  </p>
                </div>
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
                      id={`unblock-pin-${index}`}
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

          {/* Sentinel for IntersectionObserver */}
          <div ref={sentinelRef} className="h-px" />
        </div>

        {/* STICKY FOOTER with IntersectionObserver animation */}
        <div className={`flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3 transition-all duration-300 ${
          hasScrolledToBottom
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all duration-200"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: (step === 1 ? isStep1Valid : isStep2Valid) ? '#2D8653' : '#9CA3AF', color: 'white' }}
          >
            {step === 1 ? 'Suivant →' : 'Confirmer le déblocage'}
          </button>
        </div>
      </div>
    </div>
  )
}

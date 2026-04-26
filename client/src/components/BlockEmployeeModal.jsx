import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ShieldAlert, AlertTriangle, ChevronLeft } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import CustomSelect from './CustomSelect'
import AutorisationStep from './AutorisationStep'

export default function BlockEmployeeModal({ employee, isOpen, onClose, onSubmit }) {
  // ALL HOOKS MUST BE AT THE TOP - Rules of Hooks
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [step, setStep] = useState(1)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle')

  // Early return AFTER all hooks
  if (!isOpen || !employee) return null

  // Check if employee can be blocked
  const canBlock = employee.daysUsed >= 15

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
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className="bg-white dark:bg-[#16161E] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col h-[92vh] sm:max-h-[88vh] overflow-hidden"
        style={isDark ? {
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)'
        } : {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
        }}
      >
        {/* STICKY HEADER */}
        <div className="flex-shrink-0 bg-status-red/10 dark:bg-[rgba(192,57,43,0.2)] px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280] dark:text-[#8E8E93]" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-status-red/20 dark:bg-[rgba(192,57,43,0.25)] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-status-red dark:text-[#FF6B6B]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827] dark:text-[#F2F2F7]">
                {step === 1 ? t('bloquerEmploye') : t('autorisationRequise')}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#8E8E93] mt-0.5">
                Étape {step} sur 2
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280] dark:text-[#8E8E93]" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Employee info */}
          <div className="bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-warm-gray-200 dark:bg-white/[0.08] flex items-center justify-center text-sm font-semibold text-[#374151] dark:text-[#8E8E93]">
                {employee.avatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#111827] dark:text-[#F2F2F7] text-base">
                  {employee.name}
                </div>
                <div className="text-xs font-mono text-[#6B7280] dark:text-[#8E8E93]">
                  {employee.matricule}
                </div>
              </div>
            </div>

            {/* 2-column info row */}
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-black/6 dark:border-white/[0.07]">
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#8E8E93]">Jours de congé pris</div>
                <div className="text-lg font-bold text-[#111827] dark:text-[#F2F2F7] mt-0.5">
                  {employee.daysUsed}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#8E8E93]">Jours travaillés</div>
                <div className="text-lg font-bold text-[#111827] dark:text-[#F2F2F7] mt-0.5">
                  {workingDaysElapsed}
                </div>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Warning message */}
              <div className="flex gap-3 p-4 bg-status-amber/10 dark:bg-[rgba(255,159,10,0.15)] border border-status-amber/20 dark:border-[rgba(255,159,10,0.2)] rounded-xl">
                <AlertTriangle className="w-5 h-5 text-status-amber dark:text-[#FF9F0A] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-status-amber dark:text-[#FF9F0A] text-sm">
                    {t('minJoursNonRespect')}
                  </div>
                  <p className="text-xs text-[#374151] dark:text-[#8E8E93] mt-1">
                    {t('tropJoursCongeMessage')}
                  </p>
                </div>
              </div>

              {/* Reason selector */}
              <CustomSelect
                label="Motif du blocage"
                required
                value={reason}
                onChange={(value) => setReason(value)}
                placeholder={t('selectionnezMotif')}
                options={[
                  { value: t('absencesNonJustifiees'), label: t('absencesNonJustifiees') },
                  { value: t('depassementQuota'), label: t('depassementQuota') },
                  { value: t('nonRespectProcedures'), label: t('nonRespectProcedures') },
                  { value: t('autre'), label: t('autre') },
                ]}
              />

              {/* Description field */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#F2F2F7] mb-2">
                  Description
                  <span className="text-[#6B7280] dark:text-[#8E8E93] font-normal ml-1">(optionnel)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('detailsSupplementaires')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-white/[0.06] border border-warm-gray-400 dark:border-white/[0.07] rounded-xl text-[#111827] dark:text-[#F2F2F7] placeholder:text-[#6B7280] dark:placeholder:text-[#48484A] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy/20 dark:focus:ring-[#2C4A6F]/20 focus:border-navy dark:focus:border-[#2C4A6F] transition-all"
                />
              </div>

              {/* Impact notice */}
              <div className="bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl p-4">
                <h4 className="text-sm font-semibold text-[#111827] dark:text-[#F2F2F7] mb-2">
                  Conséquences du blocage
                </h4>
                <ul className="space-y-1.5 text-xs text-[#374151] dark:text-[#8E8E93]">
                  <li className="flex gap-2">
                    <span className="text-status-red dark:text-[#FF6B6B]">•</span>
                    <span>L'employé ne pourra plus demander de congés</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-red dark:text-[#FF6B6B]">•</span>
                    <span>Son statut sera marqué comme "Bloqué"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-red dark:text-[#FF6B6B]">•</span>
                    <span>Un admin RH pourra le débloquer manuellement</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <AutorisationStep
              admins={admins}
              selectedAdmin={selectedAdmin}
              onAdminSelect={(admin) => setSelectedAdmin(admin)}
              pin={pin}
              onPinChange={handlePinChange}
              pinStatus={pinStatus}
              pinIdPrefix="block-pin"
            />
          )}
        </div>

        {/* STICKY FOOTER - always visible */}
        <div className="flex-shrink-0 bg-white dark:bg-[#16161E] border-t border-gray-100 dark:border-white/[0.07] px-5 py-4 flex gap-3">
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#8E8E93] hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all duration-200"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>

          {step === 1 ? (
            <div className="relative group flex-1">
              <button
                onClick={canBlock && reason ? () => setStep(2) : undefined}
                disabled={!canBlock || !reason}
                className="w-full px-4 py-3 rounded-xl font-medium text-sm shadow-ambient transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
                style={{
                  backgroundColor: (canBlock && reason) ? '#C0392B' : '#9CA3AF',
                  color: 'white',
                  ...(isDark && (canBlock && reason) ? {
                    background: 'linear-gradient(145deg, #C0392B, #8B2E21)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
                  } : {})
                }}
                onMouseEnter={(e) => {
                  if (canBlock && reason) {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(192,57,43,0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = isDark && (canBlock && reason)
                    ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
                    : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
                }}
              >
                Suivant →
              </button>
              {!canBlock && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white text-[11px] rounded-lg px-3 py-1.5 whitespace-nowrap pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  Blocage impossible — l'employé n'a pas atteint 15 jours de congé
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isStep2Valid}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
              style={{
                backgroundColor: isStep2Valid ? '#C0392B' : '#9CA3AF',
                color: 'white',
                ...(isDark && isStep2Valid ? {
                  background: 'linear-gradient(145deg, #C0392B, #8B2E21)',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
                } : {})
              }}
              onMouseEnter={(e) => {
                if (isStep2Valid) {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(192,57,43,0.3)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = isDark && isStep2Valid
                  ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
                  : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
              }}
            >
              Confirmer le blocage
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

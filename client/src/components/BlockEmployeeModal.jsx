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

  const isStep2Valid = pinStatus === 'verified'

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      style={isDark ? { backgroundColor: 'rgba(0,0,0,0.75)' } : {}}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col h-[92vh] sm:max-h-[88vh] overflow-hidden"
        style={isDark ? {
          backgroundColor: '#0B1120',
          border: '1px solid rgba(99,157,255,0.15)',
          boxShadow: '0 0 0 1px rgba(99,157,255,0.1), 0 32px 80px rgba(0,0,0,0.7)'
        } : {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
        }}
      >
        {/* STICKY HEADER */}
        <div
          className="flex-shrink-0 bg-status-red/10 px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between"
          style={isDark ? {
            backgroundColor: 'rgba(192,57,43,0.15)',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                onMouseEnter={(e) => {
                  if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4]" />
              </button>
            )}
            <div
              className="w-10 h-10 rounded-full bg-status-red/20 flex items-center justify-center"
              style={isDark ? { backgroundColor: 'rgba(192,57,43,0.2)' } : {}}
            >
              <ShieldAlert className="w-5 h-5 text-status-red dark:text-[#FF6B6B]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827] dark:text-[#E8EFF8]">
                {step === 1 ? t('bloquerEmploye') : t('autorisationRequise')}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#7A9CC4] mt-0.5">
                Étape {step} sur 2
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
            onMouseEnter={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X className="w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4]" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Employee info */}
          <div
            className="bg-warm-gray-200 rounded-xl p-4"
            style={isDark ? {
              backgroundColor: 'rgba(99,157,255,0.06)',
              border: '1px solid rgba(99,157,255,0.12)'
            } : {}}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151]"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.12)',
                  color: '#7A9CC4'
                } : {}}
              >
                {employee.avatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#111827] dark:text-[#E8EFF8] text-base">
                  {employee.name}
                </div>
                <div className="text-xs font-mono text-[#6B7280] dark:text-[#7A9CC4]">
                  {employee.matricule}
                </div>
              </div>
            </div>

            {/* 2-column info row */}
            <div
              className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-black/6"
              style={isDark ? { borderColor: 'rgba(99,157,255,0.12)' } : {}}
            >
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">Jours de congé pris</div>
                <div className="text-lg font-bold text-[#111827] dark:text-[#E8EFF8] mt-0.5">
                  {employee.daysUsed}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">Jours travaillés</div>
                <div className="text-lg font-bold text-[#111827] dark:text-[#E8EFF8] mt-0.5">
                  {workingDaysElapsed}
                </div>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Warning message */}
              <div className="flex gap-3 p-4 bg-status-amber/10 border border-status-amber/20 rounded-xl"
                style={isDark ? {
                  backgroundColor: 'rgba(255,159,10,0.12)',
                  borderColor: 'rgba(255,159,10,0.2)'
                } : {}}
              >
                <AlertTriangle className="w-5 h-5 text-status-amber dark:text-[#FF9F0A] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-status-amber dark:text-[#FF9F0A] text-sm">
                    {t('minJoursNonRespect')}
                  </div>
                  <p className="text-xs text-[#374151] dark:text-[#7A9CC4] mt-1">
                    {t('tropJoursCongeMessage')}
                  </p>
                </div>
              </div>

              {/* Reason selector */}
              <CustomSelect
                label={t('motifBlocage')}
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
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('description')}
                  <span className="text-[#6B7280] dark:text-[#7A9CC4] font-normal ml-1">({t('optionnel')})</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('detailsSupplementaires')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] placeholder:text-[#6B7280] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
              </div>

              {/* Impact notice */}
              <div
                className="bg-warm-gray-200 rounded-xl p-4"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.06)',
                  border: '1px solid rgba(99,157,255,0.12)'
                } : {}}
              >
                <h4 className="text-sm font-semibold text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('consequencesBlocage')}
                </h4>
                <ul className="space-y-1.5 text-xs text-[#374151] dark:text-[#7A9CC4]">
                  <li className="flex gap-2">
                    <span className="text-status-red dark:text-[#FF6B6B]">•</span>
                    <span>{t('employeNePourra')}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-red dark:text-[#FF6B6B]">•</span>
                    <span>{t('statutBloqueMessage')}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-red dark:text-[#FF6B6B]">•</span>
                    <span>{t('adminPourraDebloquer')}</span>
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
        <div
          className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#7A9CC4] hover:bg-black/5 transition-all duration-200"
            onMouseEnter={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
            }}
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

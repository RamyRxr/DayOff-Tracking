import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ShieldAlert, AlertTriangle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useCurrentAdmin } from '../contexts/AdminContext'
import CustomSelect from './CustomSelect'

export default function BlockEmployeeModal({ employee, isOpen, onClose, onSubmit }) {
  // ALL HOOKS MUST BE AT THE TOP - Rules of Hooks
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const currentAdmin = useCurrentAdmin()
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')

  // Early return AFTER all hooks
  if (!isOpen || !employee) return null

  // Check if employee can be blocked
  const canBlock = employee.daysUsed >= 15

  const handleClose = () => {
    setReason('')
    setDescription('')
    onClose?.()
  }

  // Calculate current work period start and end
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  let periodStartDate
  if (currentDay >= 20) {
    // Period is 20th of this month to 19th of next month
    periodStartDate = new Date(currentYear, currentMonth, 20, 0, 0, 0, 0)
  } else {
    // Period is 20th of last month to 19th of this month
    periodStartDate = new Date(currentYear, currentMonth - 1, 20, 0, 0, 0, 0)
  }

  // Calculate working days elapsed since period start
  let workingDaysElapsed = 0
  const tempDate = new Date(periodStartDate)
  while (tempDate <= today) {
    const day = tempDate.getDay()
    if (day !== 5 && day !== 6) workingDaysElapsed++
    tempDate.setDate(tempDate.getDate() + 1)
  }

  // Determine alert level and styling based on daysUsed
  const daysUsed = employee.daysUsed || 0
  let alertLevel, alertBg, alertBorder, alertIcon, alertTitle, alertMessage, canBlock

  if (daysUsed < 5) {
    alertLevel = 'green'
    alertBg = 'rgba(52,199,89,0.12)'
    alertBorder = 'rgba(52,199,89,0.2)'
    alertIcon = '#34C759'
    alertTitle = 'Blocage impossible'
    alertMessage = "Cet employé n'a utilisé que " + daysUsed + " jours de congé. Le blocage n'est pas autorisé."
    canBlock = false
  } else if (daysUsed >= 5 && daysUsed < 11) {
    alertLevel = 'yellow'
    alertBg = 'rgba(255,204,0,0.12)'
    alertBorder = 'rgba(255,204,0,0.2)'
    alertIcon = '#FFCC00'
    alertTitle = 'Attention'
    alertMessage = "L'employé a utilisé " + daysUsed + " jours de congé."
    canBlock = true
  } else if (daysUsed >= 11 && daysUsed <= 15) {
    alertLevel = 'orange'
    alertBg = 'rgba(255,159,10,0.12)'
    alertBorder = 'rgba(255,159,10,0.2)'
    alertIcon = '#FF9F0A'
    alertTitle = 'Avertissement'
    alertMessage = "L'employé a utilisé " + daysUsed + " jours de congé. Approche de la limite."
    canBlock = true
  } else {
    alertLevel = 'red'
    alertBg = 'rgba(192,57,43,0.15)'
    alertBorder = 'rgba(192,57,43,0.2)'
    alertIcon = '#FF6B6B'
    alertTitle = 'Limite dépassée'
    alertMessage = "Vous pouvez bloquer cet employé car il a dépassé la limite avec " + daysUsed + " jours de congé."
    canBlock = true
  }


  const handleSubmit = () => {
    onSubmit?.({
      employeeId: employee.id,
      reason,
      description: description.trim(),
      daysUsed: employee.daysUsed,
      daysRemaining: employee.daysTotal - employee.daysUsed,
      adminId: currentAdmin.id,
    })
    handleClose()
  }

  const isFormValid = reason && reason.trim() && canBlock

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
            <div
              className="w-10 h-10 rounded-full bg-status-red/20 flex items-center justify-center"
              style={isDark ? { backgroundColor: 'rgba(192,57,43,0.2)' } : {}}
            >
              <ShieldAlert className="w-5 h-5 text-status-red dark:text-[#FF6B6B]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827] dark:text-[#E8EFF8]">
                {t('bloquerEmploye')}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#7A9CC4] mt-0.5">
                {employee.name}
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
                <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{t('joursDeCongeLabel')}</div>
                <div className="text-lg font-bold text-[#111827] dark:text-[#E8EFF8] mt-0.5">
                  {employee.daysUsed}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{t('joursTravaillesLabel2')}</div>
                <div className="text-lg font-bold text-[#111827] dark:text-[#E8EFF8] mt-0.5">
                  {workingDaysElapsed}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic warning message */}
              <div className="flex gap-3 p-4 rounded-xl"
                style={isDark ? {
                  backgroundColor: alertBg,
                  borderColor: alertBorder,
                  border: `1px solid ${alertBorder}`
                } : {
                  backgroundColor: alertBg,
                  borderColor: alertBorder,
                  border: `1px solid ${alertBorder}`
                }}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: alertIcon }} />
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: alertIcon }}>
                    {alertTitle}
                  </div>
                  <p className="text-xs text-[#374151] dark:text-[#7A9CC4] mt-1">
                    {alertMessage}
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
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#7A9CC4] hover:bg-black/5 transition-all duration-200"
            onMouseEnter={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {t('annuler')}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            style={{
              backgroundColor: isFormValid ? '#C0392B' : '#9CA3AF',
              color: 'white',
              ...(isDark && isFormValid ? {
                background: 'linear-gradient(145deg, #C0392B, #8B2E21)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
              } : {})
            }}
            onMouseEnter={(e) => {
              if (isFormValid) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(192,57,43,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDark && isFormValid
                ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
                : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
            }}
          >
            Confirmer le blocage
          </button>
        </div>
      </div>
    </div>
  )
}

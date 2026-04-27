import { X, Mail, Phone, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { format, isBefore, isAfter, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { useDaysOff } from '../hooks/useDaysOff'
import { useBlocks } from '../hooks/useBlocks'
import { useTheme } from '../contexts/ThemeContext'
import AddDayOffModal from './AddDayOffModal'
import BlockEmployeeModal from './BlockEmployeeModal'
import UnblockModal from './UnblockModal'
import DayOffDetailsPopup from './DayOffDetailsPopup'
import SplitCalendar from './SplitCalendar'

export default function EmployeeDetailPanel({ employee, isOpen, onClose, onUpdate }) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [showAddDayOff, setShowAddDayOff] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [showUnblock, setShowUnblock] = useState(false)
  const [selectedDayOff, setSelectedDayOff] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  // Fetch day-off records for this employee
  const { daysOff, addDayOff } = useDaysOff({ employeeId: employee?.id })

  // Block management
  const { blocks, block, unblock } = useBlocks()

  if (!isOpen || !employee) return null

  const handleAddDayOffSubmit = async (dayOffData) => {
    try {
      const result = await addDayOff(dayOffData)
      setShowAddDayOff(false)

      // Refresh employee data
      if (onUpdate) onUpdate()

      // Show alert if employee was auto-blocked
      if (result.block) {
        alert(`⚠️ Employé bloqué automatiquement: ${result.block.reason}`)
      }
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

  const handleBlockSubmit = async (blockData) => {
    try {
      await block(blockData)
      setShowBlock(false)
      if (onUpdate) onUpdate()
      alert('✅ Employé bloqué avec succès')
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

  const handleUnblockSubmit = async (unblockData) => {
    try {
      await unblock(unblockData.blockId, {
        adminId: 1,
        pin: '1234',
        reason: unblockData.reason,
        description: unblockData.description,
      })
      setShowUnblock(false)
      if (onUpdate) onUpdate()
      alert('✅ Employé débloqué avec succès')
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

  // Get active block for this employee
  const activeBlock = blocks.find(
    (b) => b.employeeId === employee?.id && b.isActive
  )

  // Current date and period variables
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  const periodStart = new Date(currentYear, currentMonth, 20)

  // Calculate total day-off days taken from actual records
  const totalDayOffDays = daysOff.reduce((sum, dayOff) => {
    const start = new Date(dayOff.startDate)
    const end = new Date(dayOff.endDate)
    let count = 0
    const current = new Date(start)
    while (current <= end) {
      const day = current.getDay()
      // Exclude Friday (5) and Saturday (6) weekends
      if (day !== 5 && day !== 6) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    return sum + count
  }, 0)

  // Calculate working days elapsed since period start (20th of month)
  const today = new Date()
  let workingDaysElapsed = 0
  const tempDate = new Date(periodStart)
  while (tempDate <= today) {
    const day = tempDate.getDay()
    if (day !== 5 && day !== 6) {
      workingDaysElapsed++
    }
    tempDate.setDate(tempDate.getDate() + 1)
  }

  const daysAvailable = 30 - totalDayOffDays

  // Generate email from name if not present
  const getEmail = () => {
    if (employee.email) return employee.email
    const names = employee.name.toLowerCase().split(' ')
    if (names.length >= 2) {
      return `${names[0]}.${names[names.length - 1]}@naftal.dz`
    }
    return `${names[0]}@naftal.dz`
  }

  // Format start date
  const getStartDate = () => {
    const date = employee.startDate || employee.createdAt
    if (!date) return '—'
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: fr })
    } catch {
      return '—'
    }
  }

  // Generate calendar for current period (20th to 19th)
  // Create set of day-off dates for quick lookup (using timestamps)
  const dayOffDates = new Set()
  daysOff.forEach((dayOff) => {
    const start = new Date(dayOff.startDate)
    const end = new Date(dayOff.endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateObj = new Date(d)
      dayOffDates.add(dateObj.setHours(0, 0, 0, 0))
    }
  })

  // Handler for clicking on day-off cells
  const handleDayOffClick = (date, e) => {
    // Find the day-off record for this day
    const dayOffRecord = employee?.daysOff?.find(d =>
      !isBefore(date, startOfDay(new Date(d.startDate))) &&
      !isAfter(date, startOfDay(new Date(d.endDate)))
    )

    if (dayOffRecord) {
      setSelectedDayOff(dayOffRecord)
      setPopupPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const statusConfig = {
    actif: { label: t('actif'), color: 'text-status-green', bg: 'bg-status-green/10' },
    risque: { label: t('aRisque'), color: 'text-status-amber', bg: 'bg-status-amber/10' },
    bloqué: { label: t('bloque'), color: 'text-status-red', bg: 'bg-status-red/10' },
  }

  const status = statusConfig[employee.status] || statusConfig.actif

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-40 transition-opacity animate-fade-in flex items-center justify-center p-6"
        onClick={onClose}
      >
        {/* Centered Modal */}
        <div
          className="bg-white dark:bg-[#16161E] rounded-2xl w-full max-w-4xl flex flex-col h-[92vh] max-h-[88vh] overflow-hidden animate-scale-in"
          style={isDark ? {
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)'
          } : {
            boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* STICKY HEADER */}
          <div className="flex-shrink-0 bg-white dark:bg-[#16161E] border-b border-gray-100 dark:border-white/[0.07] px-8 py-5 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-[#111827] dark:text-[#F2F2F7]">
                {t('detailsEmploye')}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/[0.06] active:scale-95 flex items-center justify-center transition-all duration-200"
              >
                <X className="w-6 h-6 text-[#6B7280] dark:text-[#8E8E93]" />
              </button>
            </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Employee info card */}
          <div className="bg-white/80 dark:bg-white/[0.06] backdrop-blur-xl rounded-2xl p-6 shadow-ambient border border-transparent dark:border-white/[0.07]">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-warm-gray-200 dark:bg-white/[0.08] flex items-center justify-center text-xl font-semibold text-[#374151] dark:text-[#8E8E93] flex-shrink-0">
                {employee.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-[#111827] dark:text-[#F2F2F7]">
                  {employee.name}
                </h3>
                <p className="text-sm font-mono text-[#6B7280] dark:text-[#8E8E93] mt-1">
                  {employee.matricule}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-warm-gray-300 dark:bg-white/[0.08] text-[#374151] dark:text-[#8E8E93] text-xs rounded-lg">
                    {employee.department}
                  </span>
                  <span className="px-3 py-1 bg-warm-gray-300 dark:bg-white/[0.08] text-[#374151] dark:text-[#8E8E93] text-xs rounded-lg">
                    {employee.position}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} mt-3`}>
                  <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`} />
                  <span className={`text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Contact & Start Date Info Pills */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 dark:bg-white/[0.06] rounded-lg">
                    <Mail className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#8E8E93]" />
                    <span className="text-xs text-[#6B7280] dark:text-[#8E8E93]">{getEmail()}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 dark:bg-white/[0.06] rounded-lg">
                    <Phone className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#8E8E93]" />
                    <span className="text-xs text-[#6B7280] dark:text-[#8E8E93]">{employee.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 dark:bg-white/[0.06] rounded-lg">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#8E8E93]" />
                    <span className="text-xs text-[#6B7280] dark:text-[#8E8E93]">{getStartDate()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Compact chips */}
          <div className="flex gap-2">
            <div
              className="flex-1 bg-white dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.07] rounded-xl px-4 py-3 flex flex-col gap-0.5"
              style={isDark ? {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.3)'
              } : {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <div className="text-xl font-bold text-gray-900 dark:text-[#F2F2F7]">
                {totalDayOffDays}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#8E8E93] font-medium">
                {t('joursCongeLabel')}
              </div>
            </div>
            <div
              className="flex-1 bg-white dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.07] rounded-xl px-4 py-3 flex flex-col gap-0.5"
              style={isDark ? {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.3)'
              } : {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <div className="text-xl font-bold text-gray-900 dark:text-[#F2F2F7]">
                {workingDaysElapsed}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#8E8E93] font-medium">
                {t('joursTravaillesLabel')}
              </div>
            </div>
            <div
              className="flex-1 bg-white dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.07] rounded-xl px-4 py-3 flex flex-col gap-0.5"
              style={isDark ? {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.3)'
              } : {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <div className={`text-xl font-bold ${
                daysAvailable <= 0 ? 'text-red-600 dark:text-[#FF6B6B]' :
                daysAvailable <= 4 ? 'text-amber-600 dark:text-[#FF9F0A]' :
                'text-gray-900 dark:text-[#F2F2F7]'
              }`}>
                {daysAvailable}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#8E8E93] font-medium">
                {t('joursDisponiblesLabel')}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div
            className="bg-white dark:bg-[#1C1C28] rounded-2xl p-4"
            style={isDark ? {
              boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)'
            } : {
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            {/* Month header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[13px] font-semibold text-gray-800 dark:text-[#F2F2F7] uppercase tracking-wide">
                {periodStart.toLocaleDateString('fr-DZ', { month: 'long', year: 'numeric' })}
              </h4>
              <div className="flex gap-1">
                <button className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-[#8E8E93]" />
                </button>
                <button className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-[#8E8E93]" />
                </button>
              </div>
            </div>

            {/* Split Calendar */}
            <SplitCalendar
              currentPeriod={periodStart}
              dayOffDates={dayOffDates}
              onDayOffClick={handleDayOffClick}
              isDark={isDark}
            />

            {/* Legend */}
            <div
              className="flex items-center justify-center gap-3 mt-4 pt-3"
              style={{
                borderTop: isDark ? '0.5px solid rgba(255,255,255,0.06)' : '0.5px solid rgba(0,0,0,0.06)'
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] text-gray-500 dark:text-[#8E8E93]">{t('congeLegend')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                <span className="text-[10px] text-gray-500 dark:text-[#8E8E93]">{t('weekend')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] text-gray-500 dark:text-[#8E8E93]">{t('bloqueLegend')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] text-gray-500 dark:text-[#8E8E93]">Aujourd'hui</span>
              </div>
            </div>
          </div>

          {/* Extra padding at bottom */}
          <div className="h-6" />
        </div>

        {/* STICKY FOOTER - Action buttons */}
        <div className="flex-shrink-0 bg-white dark:bg-[#16161E] border-t border-gray-100 dark:border-white/[0.06] px-8 py-5 flex gap-3">
            <button
              onClick={() => setShowAddDayOff(true)}
              disabled={employee.status === 'bloqué'}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                employee.status === 'bloqué'
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-navy dark:bg-[#2C4A6F] text-white shadow-ambient hover:shadow-modal'
              }`}
              style={employee.status !== 'bloqué' && isDark ? {
                boxShadow: '0 4px 12px rgba(26,47,79,0.4)'
              } : {}}
            >
              {t('ajouterUnConge')}
            </button>
            {employee.status !== 'bloqué' && (
              <button
                onClick={() => setShowBlock(true)}
                className="px-4 py-3 border border-status-red/20 dark:border-[#FF6B6B]/20 text-status-red dark:text-[#FF6B6B] rounded-xl font-medium text-sm hover:bg-status-red/5 dark:hover:bg-[rgba(255,107,107,0.1)] transition-all duration-200"
              >
                {t('bloquer')}
              </button>
            )}
            {employee.status === 'bloqué' && (
              <button
                onClick={() => setShowUnblock(true)}
                className="px-4 py-3 border border-status-green/20 dark:border-[#34C759]/20 text-status-green dark:text-[#34C759] rounded-xl font-medium text-sm hover:bg-status-green/5 dark:hover:bg-[rgba(52,199,89,0.1)] transition-all duration-200"
              >
                {t('debloquer')}
              </button>
            )}
        </div>
      </div>
    </div>

      {/* Modals */}
      <AddDayOffModal
        employee={employee}
        isOpen={showAddDayOff}
        onClose={() => setShowAddDayOff(false)}
        onSubmit={handleAddDayOffSubmit}
      />
      <BlockEmployeeModal
        employee={employee}
        isOpen={showBlock}
        onClose={() => setShowBlock(false)}
        onSubmit={handleBlockSubmit}
      />
      <UnblockModal
        employee={employee}
        activeBlock={activeBlock}
        isOpen={showUnblock}
        onClose={() => setShowUnblock(false)}
        onSubmit={handleUnblockSubmit}
      />

      {/* Day-Off Details Popup */}
      {selectedDayOff && (
        <DayOffDetailsPopup
          dayOff={selectedDayOff}
          position={popupPosition}
          onClose={() => setSelectedDayOff(null)}
        />
      )}
    </>
  )
}

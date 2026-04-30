import { X, Mail, Phone, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { format, isBefore, isAfter, startOfDay, isSameDay } from 'date-fns'
import { getDateLocale } from '../utils/getDateLocale'
import { useTranslation } from 'react-i18next'
import { useDaysOff } from '../hooks/useDaysOff'
import { useBlocks } from '../hooks/useBlocks'
import { useTheme } from '../contexts/ThemeContext'
import { useNotifications, createBlockNotification, createUnblockNotification } from '../hooks/useNotifications'
import { translateDepartment } from '../utils/translateDepartment'
import AddDayOffModal from './AddDayOffModal'
import BlockEmployeeModal from './BlockEmployeeModal'
import UnblockModal from './UnblockModal'
import DayOffDetailsPopup from './DayOffDetailsPopup'
import SplitCalendar from './SplitCalendar'

export default function EmployeeDetailPanel({ employee, isOpen, onClose, onUpdate }) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const locale = getDateLocale()
  const [showAddDayOff, setShowAddDayOff] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [showUnblock, setShowUnblock] = useState(false)
  const [selectedDayOff, setSelectedDayOff] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  // Calendar navigation state - start with current period
  const currentDate = new Date()
  const [calendarMonth, setCalendarMonth] = useState(currentDate.getMonth())
  const [calendarYear, setCalendarYear] = useState(currentDate.getFullYear())

  // Fetch day-off records for this employee
  const { daysOff, addDayOff, refetch: refetchDaysOff } = useDaysOff({ employeeId: employee?.id })

  // Block management
  const { blocks, block, unblock } = useBlocks()

  // Notifications
  const { addNotification } = useNotifications()

  if (!isOpen || !employee) return null

  const handleAddDayOffSubmit = async (dayOffData) => {
    try {
      const result = await addDayOff(dayOffData)
      setShowAddDayOff(false)

      // Refresh day-offs data immediately
      await refetchDaysOff()

      // Refresh employee data in parent
      if (onUpdate) await onUpdate()

      // Show alert if employee was auto-blocked
      if (result.block) {
        alert(`⚠️ Employé bloqué automatiquement: ${result.block.reason}`)
      }
    } catch (error) {
      alert(`❌ ${t('erreur')}: ${error.message}`)
    }
  }

  const handleBlockSubmit = async (blockData) => {
    try {
      await block(blockData)
      setShowBlock(false)

      // Create notification
      addNotification(createBlockNotification(employee, blockData.reason, t))

      if (onUpdate) onUpdate()
      alert(`✅ ${t('employeBloqueSucces')}`)
    } catch (error) {
      alert(`❌ ${t('erreur')}: ${error.message}`)
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

      // Create notification
      addNotification(createUnblockNotification(employee, t))

      if (onUpdate) onUpdate()
      alert(`✅ ${t('employeDebloqueSucces')}`)
    } catch (error) {
      alert(`❌ ${t('erreur')}: ${error.message}`)
    }
  }

  // Get active block for this employee
  const activeBlock = blocks.find(
    (b) => b.employeeId === employee?.id && b.isActive
  )

  // Period start for the displayed calendar (20th of selected month)
  const periodStart = new Date(calendarYear, calendarMonth, 20)

  // Navigation functions
  const handlePreviousPeriod = () => {
    const newMonth = calendarMonth - 1
    if (newMonth < 0) {
      setCalendarMonth(11)
      setCalendarYear(calendarYear - 1)
    } else {
      setCalendarMonth(newMonth)
    }
  }

  const handleNextPeriod = () => {
    const newMonth = calendarMonth + 1
    if (newMonth > 11) {
      setCalendarMonth(0)
      setCalendarYear(calendarYear + 1)
    } else {
      setCalendarMonth(newMonth)
    }
  }

  // Get month names for the period header (e.g., "April - May 2026")
  const periodStartMonth = format(new Date(calendarYear, calendarMonth, 20), 'MMMM', { locale })
  const periodEndMonth = format(new Date(calendarYear, calendarMonth + 1, 19), 'MMMM', { locale })
  const periodYearDisplay = calendarYear

  // Calculate current work period start and end
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  let periodStartDate, periodEndDate
  if (currentDay >= 20) {
    // Period is 20th of this month to 19th of next month
    periodStartDate = new Date(currentYear, currentMonth, 20, 0, 0, 0, 0)
    periodEndDate = new Date(currentYear, currentMonth + 1, 19, 23, 59, 59, 999)
  } else {
    // Period is 20th of last month to 19th of this month
    periodStartDate = new Date(currentYear, currentMonth - 1, 20, 0, 0, 0, 0)
    periodEndDate = new Date(currentYear, currentMonth, 19, 23, 59, 59, 999)
  }

  // Calculate total day-off days taken ONLY in current period
  const totalDayOffDays = daysOff.reduce((sum, dayOff) => {
    const dayOffStart = new Date(dayOff.startDate)
    const dayOffEnd = new Date(dayOff.endDate)

    // Skip if day-off is completely outside current period
    if (dayOffEnd < periodStartDate || dayOffStart > periodEndDate) {
      return sum
    }

    // Calculate overlap with current period
    const overlapStart = dayOffStart < periodStartDate ? periodStartDate : dayOffStart
    const overlapEnd = dayOffEnd > periodEndDate ? periodEndDate : dayOffEnd

    let count = 0
    const current = new Date(overlapStart)
    while (current <= overlapEnd) {
      const day = current.getDay()
      // Exclude Friday (5) and Saturday (6) weekends
      if (day !== 5 && day !== 6) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }
    return sum + count
  }, 0)

  // Calculate working days elapsed since period start
  let workingDaysElapsed = 0
  const tempDate = new Date(periodStartDate)
  const todayForCalc = new Date()
  while (tempDate <= todayForCalc && tempDate <= periodEndDate) {
    const day = tempDate.getDay()
    if (day !== 5 && day !== 6) {
      workingDaysElapsed++
    }
    tempDate.setDate(tempDate.getDate() + 1)
  }

  // Calculate days actually worked (elapsed days minus days off taken)
  const daysActuallyWorked = workingDaysElapsed - totalDayOffDays

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

  // Custom cell renderer - exact copy from AddDayOffModal with dynamic sizing
  const renderCalendarCell = (day, index, { isDark, cellSizeClass = 'w-12 h-12', textSizeClass = 'text-[15px]' }) => {
    const isWeekend = day.getDay() === 5 || day.getDay() === 6
    const isExisting = dayOffDates.has(day.setHours(0, 0, 0, 0))
    const isToday = isSameDay(day, new Date())

    let cellStyle = {}
    let textClass = `${cellSizeClass} flex items-center justify-center transition-all duration-150 rounded-lg ${textSizeClass}`

    // Apply complex styling logic - exact same as AddDayOffModal
    if (isExisting) {
      cellStyle.background = 'linear-gradient(145deg, rgba(255,59,48,0.12), rgba(192,57,43,0.08))'
      cellStyle.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.1)'
      textClass += ' text-[#C0392B] font-semibold cursor-pointer'
    } else if (isWeekend) {
      cellStyle.background = isDark ? 'rgba(99,157,255,0.03)' : '#F2F2F7'
      cellStyle.boxShadow = isDark ? 'inset 0 1px 2px rgba(0,0,0,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.04)'
      textClass += isDark ? ' text-[#4A6A8A] cursor-not-allowed' : ' text-[#C7C7CC] cursor-not-allowed'
    } else if (isToday) {
      cellStyle.background = isDark ? 'linear-gradient(145deg, rgba(99,157,255,0.12), rgba(99,157,255,0.06))' : 'linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))'
      cellStyle.boxShadow = isDark ? '0 0 0 1.5px #639DFF, inset 0 1px 0 rgba(255,255,255,0.06)' : '0 0 0 1.5px #007AFF, inset 0 1px 0 rgba(255,255,255,0.9)'
      textClass += isDark ? ' text-[#639DFF] font-semibold' : ' text-[#007AFF] font-semibold'
    } else {
      cellStyle.background = isDark ? 'rgba(99,157,255,0.05)' : 'rgba(255,255,255,0.8)'
      cellStyle.boxShadow = isDark ? 'inset 0 1px 1px rgba(255,255,255,0.04), 0 0 0 1px rgba(99,157,255,0.08)' : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)'
      textClass += isDark ? ' text-[#7A9CC4] hover:bg-white/[0.06]' : ' text-[#374151] hover:bg-[#F2F2F7]'
    }

    return (
      <button
        key={index}
        onClick={isExisting ? (e) => handleDayOffClick(day, e) : undefined}
        disabled={isWeekend}
        className={textClass}
        style={cellStyle}
      >
        {format(day, 'd')}
      </button>
    )
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
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity animate-fade-in flex items-center justify-center p-6"
        style={isDark ? { backgroundColor: 'rgba(0,0,0,0.75)' } : {}}
        onClick={onClose}
      >
        {/* Centered Modal */}
        <div
          className="bg-white rounded-2xl w-full max-w-4xl flex flex-col h-[92vh] max-h-[88vh] overflow-hidden animate-scale-in"
          style={isDark ? {
            backgroundColor: '#0B1120',
            border: '1px solid rgba(99,157,255,0.15)',
            boxShadow: '0 0 0 1px rgba(99,157,255,0.1), 0 32px 80px rgba(0,0,0,0.7)'
          } : {
            boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* STICKY HEADER */}
          <div
            className="flex-shrink-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between"
            style={isDark ? {
              backgroundColor: '#0B1120',
              borderColor: 'rgba(99,157,255,0.12)'
            } : {}}
          >
              <h2 className="font-display text-2xl font-bold text-[#111827] dark:text-[#E8EFF8]">
                {t('detailsEmploye')}
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-black/5 active:scale-95 flex items-center justify-center transition-all duration-200"
                style={isDark ? {
                  ':hover': { backgroundColor: 'rgba(99,157,255,0.08)' }
                } : {}}
                onMouseEnter={(e) => {
                  if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <X className="w-6 h-6 text-[#6B7280] dark:text-[#7A9CC4]" />
              </button>
            </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Employee info card */}
          <div
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-ambient border border-transparent"
            style={isDark ? {
              backgroundColor: 'rgba(13,21,38,0.75)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99,157,255,0.12)',
              boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 4px 16px rgba(0,0,0,0.4)'
            } : {}}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full bg-warm-gray-200 flex items-center justify-center text-xl font-semibold text-[#374151] flex-shrink-0"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.12)',
                  color: '#7A9CC4',
                  border: '1px solid rgba(99,157,255,0.2)'
                } : {}}
              >
                {employee.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-[#111827] dark:text-[#E8EFF8]">
                  {employee.name}
                </h3>
                <p className="text-sm font-mono text-[#6B7280] dark:text-[#7A9CC4] mt-1">
                  {employee.matricule}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="px-3 py-1 bg-warm-gray-300 text-[#374151] text-xs rounded-lg"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.08)',
                      color: '#7A9CC4'
                    } : {}}
                  >
                    {translateDepartment(employee.department, t)}
                  </span>
                  <span
                    className="px-3 py-1 bg-warm-gray-300 text-[#374151] text-xs rounded-lg"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.08)',
                      color: '#7A9CC4'
                    } : {}}
                  >
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
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 rounded-lg"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.06)'
                    } : {}}
                  >
                    <Mail className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7A9CC4]" />
                    <span className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{getEmail()}</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 rounded-lg"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.06)'
                    } : {}}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7A9CC4]" />
                    <span className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{employee.phone || '—'}</span>
                  </div>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 rounded-lg"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.06)'
                    } : {}}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#7A9CC4]" />
                    <span className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{getStartDate()}</span>
                  </div>
                  {employee.ssn && (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 rounded-lg"
                      style={isDark ? {
                        backgroundColor: 'rgba(99,157,255,0.06)'
                      } : {}}
                    >
                      <span className="text-xs font-mono text-[#6B7280] dark:text-[#7A9CC4]">NSS: {employee.ssn}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats - Compact chips */}
          <div className="flex gap-2">
            <div
              className="flex-1 bg-white border border-black/[0.06] rounded-xl px-4 py-3 flex flex-col gap-0.5"
              style={isDark ? {
                backgroundColor: 'rgba(13,21,38,0.75)',
                border: '1px solid rgba(99,157,255,0.12)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)'
              } : {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <div className="text-xl font-bold text-gray-900 dark:text-[#E8EFF8]">
                {totalDayOffDays}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#7A9CC4] font-medium">
                {t('joursCongeLabel')}
              </div>
            </div>
            <div
              className="flex-1 bg-white border border-black/[0.06] rounded-xl px-4 py-3 flex flex-col gap-0.5"
              style={isDark ? {
                backgroundColor: 'rgba(13,21,38,0.75)',
                border: '1px solid rgba(99,157,255,0.12)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)'
              } : {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <div className="text-xl font-bold text-gray-900 dark:text-[#E8EFF8]">
                {daysActuallyWorked}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#7A9CC4] font-medium">
                {t('joursTravaillesLabel')}
              </div>
            </div>
            <div
              className="flex-1 bg-white border border-black/[0.06] rounded-xl px-4 py-3 flex flex-col gap-0.5"
              style={isDark ? {
                backgroundColor: 'rgba(13,21,38,0.75)',
                border: '1px solid rgba(99,157,255,0.12)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)'
              } : {
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              <div className={`text-xl font-bold ${
                daysAvailable <= 0 ? 'text-red-600 dark:text-[#FF6B6B]' :
                daysAvailable <= 4 ? 'text-amber-600 dark:text-[#FF9F0A]' :
                'text-gray-900 dark:text-[#E8EFF8]'
              }`}>
                {daysAvailable}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#7A9CC4] font-medium">
                {t('joursDisponiblesLabel')}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div
            className="bg-white rounded-2xl p-4"
            style={isDark ? {
              backgroundColor: 'rgba(13,21,38,0.75)',
              border: '1px solid rgba(99,157,255,0.12)',
              boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 4px 12px rgba(0,0,0,0.4)'
            } : {
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)'
            }}
          >
            {/* Month header */}
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[13px] font-semibold text-gray-800 dark:text-[#E8EFF8] uppercase tracking-wide">
                {periodStartMonth} - {periodEndMonth} {periodYearDisplay}
              </h4>
              <div className="flex gap-1">
                <button
                  onClick={handlePreviousPeriod}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  style={isDark ? {} : {}}
                  onMouseEnter={(e) => {
                    if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-[#7A9CC4]" />
                </button>
                <button
                  onClick={handleNextPeriod}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  style={isDark ? {} : {}}
                  onMouseEnter={(e) => {
                    if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-[#7A9CC4]" />
                </button>
              </div>
            </div>

            {/* Split Calendar */}
            <SplitCalendar
              currentPeriod={periodStart}
              dayOffDates={dayOffDates}
              onDayOffClick={handleDayOffClick}
              isDark={isDark}
              renderCell={renderCalendarCell}
              cellSize="large"
            />

            {/* Legend */}
            <div
              className="flex items-center justify-center gap-3 mt-4 pt-3"
              style={{
                borderTop: isDark ? '0.5px solid rgba(99,157,255,0.12)' : '0.5px solid rgba(0,0,0,0.06)'
              }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] text-gray-500 dark:text-[#7A9CC4]">{t('congeLegend')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                <span className="text-[10px] text-gray-500 dark:text-[#7A9CC4]">{t('weekend')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] text-gray-500 dark:text-[#7A9CC4]">{t('aujourdhui')}</span>
              </div>
            </div>
          </div>

          {/* Extra padding at bottom */}
          <div className="h-6" />
        </div>

        {/* STICKY FOOTER - Action buttons */}
        <div
          className="flex-shrink-0 bg-white border-t border-gray-100 px-8 py-5 flex gap-3"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
            <button
              onClick={() => setShowAddDayOff(true)}
              disabled={employee.status === 'bloqué'}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                employee.status === 'bloqué'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-navy text-white shadow-ambient hover:shadow-modal'
              }`}
              style={
                employee.status === 'bloqué' && isDark
                  ? {
                      backgroundColor: 'rgba(99,157,255,0.06)',
                      color: '#4A6A8A'
                    }
                  : employee.status !== 'bloqué' && isDark
                  ? {
                      background: 'linear-gradient(145deg, #2A5494, #1E3D6B)',
                      border: '1px solid rgba(99,157,255,0.2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                    }
                  : {}
              }
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

import { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Upload, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEmployees } from '../hooks/useEmployees'
import { useDaysOff } from '../hooks/useDaysOff'
import { useCurrentAdmin } from '../contexts/AdminContext'
import { useTheme } from '../contexts/ThemeContext'
import CustomSelect from './CustomSelect'
import SplitCalendar from './SplitCalendar'

export default function HomeAddDayOffModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const currentAdmin = useCurrentAdmin()
  const [step, setStep] = useState(1)

  // Step 1: Employee selection
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [calendarOffset, setCalendarOffset] = useState(0)

  // Step 2: Dates and reason
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [reason, setReason] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const typeSelectRef = useRef(null)

  const { employees, loading } = useEmployees()
  const { daysOff, addDayOff } = useDaysOff({ employeeId: selectedEmployee?.id })

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees
    const query = searchQuery.toLowerCase()
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      emp.matricule.toLowerCase().includes(query)
    )
  }, [employees, searchQuery])

  // Generate existing day-off dates set
  const existingDates = useMemo(() => {
    const dates = new Set()
    daysOff?.forEach(dayOff => {
      const start = new Date(dayOff.startDate)
      const end = new Date(dayOff.endDate)
      const current = new Date(start)
      while (current <= end) {
        dates.add(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
    })
    return dates
  }, [daysOff])

  // Calculate displayed period based on calendar offset
  const displayedPeriod = useMemo(() => {
    const today = new Date()
    const baseMonth = today.getMonth()
    const baseYear = today.getFullYear()

    // Calculate the display month based on offset
    const totalMonths = baseYear * 12 + baseMonth + calendarOffset
    const displayYear = Math.floor(totalMonths / 12)
    const displayMonth = totalMonths % 12

    // Work period: 20th of displayMonth to 19th of (displayMonth + 1)
    const periodStart = new Date(displayYear, displayMonth, 20)
    periodStart.setHours(0, 0, 0, 0)

    const periodEnd = new Date(displayYear, displayMonth + 1, 19)
    periodEnd.setHours(23, 59, 59, 999)

    return { start: periodStart, end: periodEnd }
  }, [calendarOffset])

  // Calculate period-specific stats
  const periodStats = useMemo(() => {
    if (!selectedEmployee || !daysOff) {
      return { daysOffCount: 0, workedDays: 0, availableDays: 15 }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Count day-offs in the displayed period
    let daysOffCount = 0
    daysOff.forEach(dayOff => {
      const start = new Date(dayOff.startDate)
      const end = new Date(dayOff.endDate)
      const current = new Date(start)

      while (current <= end) {
        if (current >= displayedPeriod.start && current <= displayedPeriod.end) {
          const dayOfWeek = current.getDay()
          if (dayOfWeek !== 5 && dayOfWeek !== 6) {
            daysOffCount++
          }
        }
        current.setDate(current.getDate() + 1)
      }
    })

    // Calculate worked days
    let workedDays = 0
    if (today >= displayedPeriod.start && today <= displayedPeriod.end) {
      // Current period: count from period start to today
      const current = new Date(displayedPeriod.start)
      while (current <= today) {
        const dayOfWeek = current.getDay()
        if (dayOfWeek !== 5 && dayOfWeek !== 6) {
          workedDays++
        }
        current.setDate(current.getDate() + 1)
      }
      workedDays -= daysOffCount
    } else if (today > displayedPeriod.end) {
      // Past period: count all working days
      const current = new Date(displayedPeriod.start)
      while (current <= displayedPeriod.end) {
        const dayOfWeek = current.getDay()
        if (dayOfWeek !== 5 && dayOfWeek !== 6) {
          workedDays++
        }
        current.setDate(current.getDate() + 1)
      }
      workedDays -= daysOffCount
    }
    // Future period: workedDays = 0 (already initialized)

    const availableDays = Math.max(0, 15 - daysOffCount)

    return { daysOffCount, workedDays, availableDays }
  }, [selectedEmployee, daysOff, displayedPeriod])

  if (!isOpen) return null

  const handleClose = () => {
    setStep(1)
    setSearchQuery('')
    setSelectedEmployee(null)
    setCalendarOffset(0)
    setStartDate(null)
    setEndDate(null)
    setUploadedFile(null)
    setReason('')
    setSuccessMsg('')
    onClose?.()
  }

  const handleDayClick = (day) => {
    const dayStr = day.toISOString().split('T')[0]

    // Check if day is selectable (only weekends and existing dates are blocked)
    if (day.getDay() === 5 || day.getDay() === 6) return
    if (existingDates.has(dayStr)) return

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(day)
      setEndDate(null)
    } else {
      // Complete selection
      if (day < startDate) {
        setEndDate(startDate)
        setStartDate(day)
      } else {
        setEndDate(day)
      }
    }
  }

  const calculateWorkingDays = () => {
    if (!startDate || !endDate) return 0
    let count = 0
    const current = new Date(startDate)
    while (current <= endDate) {
      const day = current.getDay()
      if (day !== 5 && day !== 6) count++
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  const calculateCalendarDays = () => {
    if (!startDate || !endDate) return 0
    const diff = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))
    return diff + 1
  }

  const workingDays = calculateWorkingDays()
  const totalCalendarDays = calculateCalendarDays()
  const hasSandwich = totalCalendarDays > workingDays

  // Custom cell renderer for range selection
  const renderCalendarCell = (day, index, { isDark: _, cellSizeClass = 'w-9 h-9', textSizeClass = 'text-[13px]' } = {}) => {
    const dayStr = day.toISOString().split('T')[0]
    const isWeekend = day.getDay() === 5 || day.getDay() === 6
    const isExisting = existingDates.has(dayStr)
    const isStart = startDate && day.toDateString() === startDate.toDateString()
    const isEnd = endDate && day.toDateString() === endDate.toDateString()
    const isInRange = startDate && endDate && day > startDate && day < endDate
    const isToday = isSameDay(day, new Date())

    let cellStyle = {}
    let textClass = `${cellSizeClass} flex items-center justify-center transition-all duration-150 rounded-lg ${textSizeClass}`

    // Apply complex styling logic
    if (isExisting) {
      cellStyle.background = 'linear-gradient(145deg, rgba(255,59,48,0.12), rgba(192,57,43,0.08))'
      cellStyle.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.1)'
      textClass += ' text-[#C0392B] font-semibold cursor-not-allowed'
    } else if (isStart || isEnd) {
      cellStyle.background = isDark ? 'linear-gradient(145deg, #639DFF, #4A7FCC)' : 'linear-gradient(145deg, #007AFF, #0055D4)'
      cellStyle.boxShadow = isDark ? 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(99,157,255,0.4)' : 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(0,122,255,0.35)'
      textClass += ' text-white font-bold'
    } else if (isInRange) {
      cellStyle.background = isDark ? 'linear-gradient(145deg, rgba(99,157,255,0.15), rgba(99,157,255,0.08))' : 'linear-gradient(145deg, rgba(0,122,255,0.1), rgba(0,122,255,0.06))'
      cellStyle.boxShadow = isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(99,157,255,0.2)' : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,122,255,0.15)'
      textClass += isDark ? ' text-[#639DFF] font-medium' : ' text-[#0055D4] font-medium'
    } else if (isWeekend) {
      cellStyle.background = isDark ? 'rgba(99,157,255,0.03)' : '#F2F2F7'
      cellStyle.boxShadow = isDark ? 'inset 0 1px 2px rgba(0,0,0,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.04)'
      textClass += isDark ? ' text-[#4A6A8A] cursor-not-allowed' : ' text-[#C7C7CC] cursor-not-allowed'
    } else if (isToday && !isStart && !isEnd) {
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
        onClick={() => handleDayClick(day)}
        disabled={isWeekend || isExisting}
        className={textClass}
        style={cellStyle}
      >
        {format(day, 'd')}
      </button>
    )
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5 Mo)')
      return
    }

    setUploadedFile(file)
  }

  const handleFinalSubmit = async () => {
    if (!selectedEmployee || !startDate || !endDate || !reason || !currentAdmin?.id) return

    console.log('[DayOff Submit]', {
      employeeId: selectedEmployee.id,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      type: reason,
      adminId: currentAdmin.id
    })

    try {
      await addDayOff({
        employeeId: selectedEmployee.id,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        type: reason,
        adminId: currentAdmin.id
      })

      setSuccessMsg('Congé ajouté avec succès')
      setTimeout(() => {
        setSuccessMsg('')
        handleClose()
        onSuccess?.()
      }, 1500)
    } catch (error) {
      setSuccessMsg(`Erreur: ${error.message}`)
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const isStep1Valid = !!selectedEmployee && !!startDate && !!endDate && !!reason
  const isStep2Valid = true

  const getStatusConfig = (status) => {
    const configs = {
      actif: { label: t('actif'), dotColor: 'bg-status-green', bgColor: 'bg-status-green/10', textColor: 'text-status-green' },
      risque: { label: t('aRisqueStatus'), dotColor: 'bg-status-amber', bgColor: 'bg-status-amber/10', textColor: 'text-status-amber' },
      bloqué: { label: t('bloque'), dotColor: 'bg-status-red', bgColor: 'bg-status-red/10', textColor: 'text-status-red' },
    }
    return configs[status] || configs.actif
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      style={isDark ? {
        backgroundColor: 'rgba(0,0,0,0.75)'
      } : {}}
    >
      <div
        className="bg-white dark:bg-[#16161E] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col h-[92vh] sm:max-h-[88vh] overflow-hidden"
        style={isDark ? {
          backgroundColor: '#0B1120',
          border: '1px solid rgba(99,157,255,0.15)',
          boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 24px 64px rgba(0,0,0,0.6)'
        } : {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
        }}
      >
        {/* STICKY HEADER */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
                style={isDark ? {
                  backgroundColor: 'transparent'
                } : {}}
                onMouseEnter={(e) => {
                  if (isDark) {
                    e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (isDark) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4]" />
              </button>
            )}
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827] dark:text-[#E8EFF8]">
                {t('ajouterConge')}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#7A9CC4] mt-0.5">
                {t('etape')} {step} {t('sur')} 2 — {
                  step === 1 ? 'Sélection et dates' : 'Confirmation'
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors"
            style={isDark ? {
              backgroundColor: 'transparent'
            } : {}}
            onMouseEnter={(e) => {
              if (isDark) {
                e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (isDark) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <X className="w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4]" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5">
          {step === 1 && (
            <>
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#7A9CC4]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('rechercherMatricule')}
                  autoFocus
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[rgba(118,118,128,0.08)] dark:bg-white/[0.06] border-0 text-sm text-[#111827] dark:text-[#E8EFF8] placeholder:text-[#6B7280] dark:placeholder:text-[#7A9CC4] focus:outline-none focus:ring-2 focus:ring-navy/20 dark:focus:ring-[#2C4A6F]/20"
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: 'rgba(99,157,255,0.12)',
                    border: '1px solid',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
                  } : {
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)'
                  }}
                />
              </div>

              {/* Employee list */}
              <div className="space-y-2">
                {loading ? (
                  // Skeleton loading
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-warm-gray-200 dark:bg-white/[0.06]"
                      style={isDark ? {
                        backgroundColor: 'rgba(99,157,255,0.06)'
                      } : {}}
                    >
                      <div
                        className="w-8 h-8 rounded-full bg-warm-gray-300 dark:bg-white/[0.08]"
                        style={isDark ? {
                          backgroundColor: 'rgba(99,157,255,0.1)'
                        } : {}}
                      />
                      <div className="flex-1 space-y-2">
                        <div
                          className="h-4 bg-warm-gray-300 dark:bg-white/[0.08] rounded w-1/2"
                          style={isDark ? {
                            backgroundColor: 'rgba(99,157,255,0.12)'
                          } : {}}
                        />
                        <div
                          className="h-3 bg-warm-gray-300 dark:bg-white/[0.08] rounded w-1/3"
                          style={isDark ? {
                            backgroundColor: 'rgba(99,157,255,0.12)'
                          } : {}}
                        />
                      </div>
                    </div>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <div className="py-8 text-center text-[#6B7280] dark:text-[#7A9CC4]">
                    {t('aucunEmployeTrouve')}
                  </div>
                ) : (
                  filteredEmployees.map(emp => {
                    const isSelected = selectedEmployee?.id === emp.id
                    const status = getStatusConfig(emp.status)
                    return (
                      <button
                        key={emp.id}
                        onClick={() => setSelectedEmployee(emp)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-navy dark:border-[#2C4A6F] bg-navy/5 dark:bg-[#2C4A6F]/10'
                            : 'border-transparent bg-warm-gray-200 dark:bg-white/[0.06] hover:bg-black/[0.02] dark:hover:bg-white/[0.08]'
                        }`}
                        style={isDark ? (
                          isSelected
                            ? {
                                borderColor: 'rgba(99,157,255,0.3)',
                                backgroundColor: 'rgba(99,157,255,0.12)'
                              }
                            : {
                                backgroundColor: 'rgba(99,157,255,0.06)'
                              }
                        ) : {}}
                        onMouseEnter={(e) => {
                          if (isDark && !isSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.1)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isDark && !isSelected) {
                            e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.06)'
                          }
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full bg-warm-gray-300 dark:bg-white/[0.08] flex items-center justify-center text-xs font-semibold text-[#374151] dark:text-[#8E8E93]"
                          style={isDark ? {
                            backgroundColor: 'rgba(99,157,255,0.15)',
                            color: '#7A9CC4'
                          } : {}}
                        >
                          {emp.avatar}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-semibold text-sm text-[#111827] dark:text-[#E8EFF8] truncate">
                            {emp.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono text-[#6B7280] dark:text-[#7A9CC4]">{emp.matricule}</span>
                            <span
                              className="px-2 py-0.5 bg-warm-gray-300 dark:bg-white/[0.08] text-[#374151] dark:text-[#8E8E93] text-[10px] rounded-md"
                              style={isDark ? {
                                backgroundColor: 'rgba(99,157,255,0.1)',
                                color: '#7A9CC4'
                              } : {}}
                            >
                              {emp.department}
                            </span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bgColor}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                          <span className={`text-[10px] font-medium ${status.textColor}`}>
                            {status.label}
                          </span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {/* Selected employee preview with calendar and stats */}
              {selectedEmployee && (
                <>
                  <div
                    className="bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl p-4"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.08)',
                      border: '1px solid rgba(99,157,255,0.12)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                    } : {
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-warm-gray-300 dark:bg-white/[0.08] flex items-center justify-center text-sm font-semibold text-[#374151] dark:text-[#8E8E93]"
                        style={isDark ? {
                          backgroundColor: 'rgba(99,157,255,0.15)',
                          color: '#7A9CC4'
                        } : {}}
                      >
                        {selectedEmployee.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[#111827] dark:text-[#E8EFF8]">
                          {selectedEmployee.name}
                        </div>
                        <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">
                          {selectedEmployee.matricule} · {selectedEmployee.department}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calendar navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCalendarOffset(prev => prev - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                      style={isDark ? { backgroundColor: 'transparent' } : {}}
                      onMouseEnter={(e) => {
                        if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                      }}
                      onMouseLeave={(e) => {
                        if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <ChevronLeft size={16} className="text-[#6B7280] dark:text-[#7A9CC4]" />
                    </button>
                    <span className="text-[13px] font-semibold text-[#111827] dark:text-[#E8EFF8]">
                      {format(displayedPeriod.start, 'dd MMM yyyy', { locale: fr })}
                      {' → '}
                      {format(displayedPeriod.end, 'dd MMM yyyy', { locale: fr })}
                    </span>
                    <button
                      onClick={() => setCalendarOffset(prev => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                      style={isDark ? { backgroundColor: 'transparent' } : {}}
                      onMouseEnter={(e) => {
                        if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                      }}
                      onMouseLeave={(e) => {
                        if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <ChevronRight size={16} className="text-[#6B7280] dark:text-[#7A9CC4]" />
                    </button>
                  </div>

                  {/* Calendar */}
                  <SplitCalendar
                    currentPeriod={displayedPeriod.start}
                    isDark={isDark}
                    renderCell={renderCalendarCell}
                  />

                  {/* Period stats cards */}
                  <div className="flex gap-2">
                    <div
                      className="flex-1 bg-white dark:bg-[#1C1C28] rounded-lg px-2 py-1.5 text-center"
                      style={isDark ? {
                        backgroundColor: 'rgba(13,21,38,0.6)',
                        border: '1px solid rgba(99,157,255,0.12)'
                      } : {}}
                    >
                      <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{t('joursConge')}</div>
                      <div className="text-sm font-bold text-navy dark:text-[#639DFF]">{periodStats.daysOffCount}</div>
                    </div>
                    <div
                      className="flex-1 bg-white dark:bg-[#1C1C28] rounded-lg px-2 py-1.5 text-center"
                      style={isDark ? {
                        backgroundColor: 'rgba(13,21,38,0.6)',
                        border: '1px solid rgba(99,157,255,0.12)'
                      } : {}}
                    >
                      <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{t('joursTravailles')}</div>
                      <div className="text-sm font-bold text-navy dark:text-[#639DFF]">
                        {periodStats.workedDays}
                      </div>
                    </div>
                    <div
                      className="flex-1 bg-white dark:bg-[#1C1C28] rounded-lg px-2 py-1.5 text-center"
                      style={isDark ? {
                        backgroundColor: 'rgba(13,21,38,0.6)',
                        border: '1px solid rgba(99,157,255,0.12)'
                      } : {}}
                    >
                      <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{t('joursDisponibles')}</div>
                      <div className="text-sm font-bold text-navy dark:text-[#639DFF]">
                        {periodStats.availableDays}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* Calendar */}
              <SplitCalendar
                currentPeriod={new Date()}
                isDark={isDark}
                renderCell={renderCalendarCell}
              />


              {/* Date summary */}
              {startDate && endDate && (
                <div
                  className="bg-navy/5 dark:bg-[#2C4A6F]/10 rounded-xl p-4"
                  style={isDark ? {
                    backgroundColor: 'rgba(99,157,255,0.1)',
                    border: '1px solid rgba(99,157,255,0.12)'
                  } : {}}
                >
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <div className="text-[#6B7280] dark:text-[#7A9CC4] text-xs">{t('dateDebut')}</div>
                      <div className="font-semibold text-navy dark:text-[#639DFF]">
                        {format(startDate, 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                    <div className="text-[#6B7280] dark:text-[#7A9CC4]">→</div>
                    <div>
                      <div className="text-[#6B7280] dark:text-[#7A9CC4] text-xs">{t('dateFin')}</div>
                      <div className="font-semibold text-navy dark:text-[#639DFF]">
                        {format(endDate, 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-[#374151] dark:text-[#7A9CC4]">
                    <div>
                      <span className="font-bold text-navy dark:text-[#639DFF]">{workingDays}</span> {t('joursOuvrables')}
                    </div>
                    <div>
                      <span className="font-bold text-navy dark:text-[#639DFF]">{totalCalendarDays}</span> {t('joursCalendaires')}
                    </div>
                    {hasSandwich && (
                      <div className="flex items-center gap-1 text-status-amber dark:text-[#FF9F0A]">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">{t('sandwichDetection')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('pieceJustificative')}
                </label>
                <label
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-warm-gray-400 dark:border-white/[0.12] rounded-xl cursor-pointer hover:bg-warm-gray-200 dark:hover:bg-white/[0.06] transition-colors"
                  style={isDark ? {
                    borderColor: 'rgba(99,157,255,0.2)',
                    backgroundColor: 'transparent'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (isDark) {
                      e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.06)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isDark) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Upload className="w-6 h-6 text-[#6B7280] dark:text-[#7A9CC4] mb-2" />
                  <span className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">
                    {uploadedFile ? uploadedFile.name : t('glisserCliquer')}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* Reason selector */}
              <div ref={typeSelectRef}>
                <CustomSelect
                  label={t('typeConge')}
                  required
                  value={reason}
                  onChange={setReason}
                  placeholder={t('typeConge')}
                  options={[
                    { value: 'annual', label: t('congeAnnuel') },
                    { value: 'sick', label: t('congeMaladie') },
                    { value: 'unpaid', label: t('congeSansSolde') },
                    { value: 'other', label: t('autre') },
                  ]}
                  onOpen={() => {
                    setTimeout(() => {
                      typeSelectRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                      })
                    }, 150)
                  }}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Summary */}
              <div
                className="bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl p-4 mb-4"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.08)',
                  border: '1px solid rgba(99,157,255,0.12)'
                } : {}}
              >
                <div className="text-sm font-semibold text-[#111827] dark:text-[#E8EFF8] mb-2">
                  Résumé du congé
                </div>
                <div className="space-y-2 text-sm text-[#6B7280] dark:text-[#7A9CC4]">
                  <div className="flex justify-between">
                    <span>Employé:</span>
                    <span className="font-medium text-[#111827] dark:text-[#E8EFF8]">{selectedEmployee?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Période:</span>
                    <span className="font-medium text-[#111827] dark:text-[#E8EFF8]">
                      {startDate && endDate && `${format(startDate, 'dd MMM', { locale: fr })} – ${format(endDate, 'dd MMM yyyy', { locale: fr })}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jours ouvrables:</span>
                    <span className="font-bold text-navy dark:text-[#639DFF]">{workingDays} jours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="font-medium text-[#111827] dark:text-[#E8EFF8]">
                      {reason === 'annual' ? t('congeAnnuel') : reason === 'sick' ? t('congeMaladie') : reason === 'unpaid' ? t('congeSansSolde') : t('autre')}
                    </span>
                  </div>
                  {hasSandwich && (
                    <div className="flex items-center gap-2 text-status-amber dark:text-[#FF9F0A] pt-2 border-t border-black/6 dark:border-white/[0.06]">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-medium">Détection sandwich — Week-end inclus</span>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="bg-blue-50 dark:bg-[rgba(99,157,255,0.08)] border border-blue-200 dark:border-[rgba(99,157,255,0.15)] rounded-xl p-3 text-xs text-blue-800 dark:text-[#639DFF]"
              >
                Ajouté par: {currentAdmin?.name} — {currentAdmin?.role}
              </div>
            </>
          )}

          {/* Extra padding at bottom */}
          <div className="h-6" />
        </div>

        {/* STICKY FOOTER */}
        <div
          className="flex-shrink-0 px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#16161E]"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          {/* Success message */}
          {successMsg && (
            <div className={`mb-3 px-4 py-2 rounded-lg text-sm text-center ${
              successMsg.includes('Erreur') || successMsg.includes('erreur')
                ? 'bg-red-50 dark:bg-[rgba(192,57,43,0.15)] text-red-700 dark:text-[#FF6B6B] border border-red-200 dark:border-[rgba(255,59,48,0.2)]'
                : 'bg-green-50 dark:bg-[rgba(52,199,89,0.15)] text-green-700 dark:text-[#34C759] border border-green-200 dark:border-[rgba(52,199,89,0.2)]'
            }`}>
              {successMsg}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={step === 1 ? handleClose : () => setStep(1)}
              disabled={!!successMsg}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#7A9CC4] hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all duration-200 disabled:opacity-50"
              style={isDark ? { backgroundColor: 'transparent' } : {}}
              onMouseEnter={(e) => {
                if (isDark && !successMsg) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                }
              }}
              onMouseLeave={(e) => {
                if (isDark && !successMsg) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {step === 1 ? t('annuler') : 'Retour'}
            </button>
            <button
              onClick={step === 2 ? handleFinalSubmit : () => setStep(2)}
              disabled={
                (step === 1 && !isStep1Valid) ||
                (step === 2 && !isStep2Valid) ||
                !!successMsg
              }
              className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
              style={
                ((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid)) && !successMsg
                  ? (isDark ? {
                      background: 'linear-gradient(145deg, #2A5494, #1E3D6B)',
                      color: 'white',
                      border: '1px solid rgba(99,157,255,0.2)',
                      boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.5)'
                    } : {
                      backgroundColor: '#1A2F4F',
                      color: 'white'
                    })
                  : {
                      backgroundColor: '#9CA3AF',
                      color: 'white'
                    }
              }
            >
              {step === 2 ? 'Confirmer le congé' : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

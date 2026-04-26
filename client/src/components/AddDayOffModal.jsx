import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Upload, AlertTriangle, ChevronLeft } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useDaysOff } from '../hooks/useDaysOff'
import { useTheme } from '../contexts/ThemeContext'
import CustomSelect from './CustomSelect'
import AutorisationStep from './AutorisationStep'
import SplitCalendar from './SplitCalendar'

export default function AddDayOffModal({ employee, isOpen, onClose, onSubmit }) {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [step, setStep] = useState(1)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [reason, setReason] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle') // idle | verifying | verified | error
  const typeSelectRef = useRef(null)

  const { daysOff } = useDaysOff({ employeeId: employee?.id })

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

  // Generate calendar days for work period (20th to 19th split)
  const { currentMonthDays, nextMonthDays, currentMonthObj, nextMonthObj } = useMemo(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    const currentMonthObj = new Date(currentYear, currentMonth, 1)

    // Next month handling (wrap to next year if December)
    const nextMonth = currentMonth + 1
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear
    const normalizedNextMonth = nextMonth % 12
    const nextMonthObj = new Date(nextYear, normalizedNextMonth, 1)

    // Generate days 20 to end of current month
    const daysInCurrentMonth = endOfMonth(currentMonthObj).getDate()
    const currentDays = []
    for (let d = 20; d <= daysInCurrentMonth; d++) {
      currentDays.push(new Date(currentYear, currentMonth, d))
    }

    // Pad start with empty cells for grid alignment
    const firstDayOfWeek = currentDays[0].getDay()
    const currentDaysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    for (let i = 0; i < currentDaysToAdd; i++) {
      currentDays.unshift(null) // null for empty cells
    }

    // Generate days 1 to 19 of next month
    const nextDays = []
    for (let d = 1; d <= 19; d++) {
      nextDays.push(new Date(nextYear, normalizedNextMonth, d))
    }

    // Pad start with empty cells for grid alignment
    const nextFirstDayOfWeek = nextDays[0].getDay()
    const nextDaysToAdd = nextFirstDayOfWeek === 0 ? 6 : nextFirstDayOfWeek - 1
    for (let i = 0; i < nextDaysToAdd; i++) {
      nextDays.unshift(null) // null for empty cells
    }

    return {
      currentMonthDays: currentDays,
      nextMonthDays: nextDays,
      currentMonthObj,
      nextMonthObj
    }
  }, [])

  // Early return AFTER all hooks
  if (!isOpen) return null
  if (!employee) return null

  const handleClose = () => {
    setStep(1)
    setStartDate(null)
    setEndDate(null)
    setUploadedFile(null)
    setReason('')
    setSelectedAdmin(null)
    setPin(['', '', '', ''])
    setPinStatus('idle')
    onClose?.()
  }

  // Mock admins
  const admins = [
    { id: 1, name: 'Ahmed Benali', role: 'Responsable RH', initials: 'AB' },
    { id: 2, name: 'Fatima Meziane', role: 'Directeur Admin', initials: 'FM' },
  ]

  const handleDayClick = (day) => {
    const dayStr = day.toISOString().split('T')[0]
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if day is selectable
    if (day < today) return
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

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5 Mo)')
      return
    }

    setUploadedFile(file)
  }

  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1]
    if (value && !/^[0-9]$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    // Auto-focus next
    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus()
    }

    // Auto-validate
    if (newPin.every(d => d !== '') && newPin.length === 4) {
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
        document.getElementById('pin-0')?.focus()
      }, 1500)
    }
  }

  const handleSubmit = async () => {
    if (!employee?.id || !startDate || !endDate) return

    try {
      await onSubmit?.({
        employeeId: employee.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        workingDays,
        reason,
        file: uploadedFile,
      })

      handleClose()
      alert('✅ Congé ajouté avec succès')
      navigate('/')
    } catch (error) {
      alert(`❌ Erreur: ${error.message}`)
      // Stay on current page if error
    }
  }

  const isStep1Valid = startDate && endDate && reason
  const isStep2Valid = pinStatus === 'verified'

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className="bg-white dark:bg-[#16161E] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col h-[92vh] sm:max-h-[88vh] overflow-hidden"
        style={isDark ? {
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)'
        } : {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
        }}
      >
        {/* STICKY HEADER */}
        <div className="flex-shrink-0 bg-white dark:bg-[#16161E] border-b border-gray-100 dark:border-white/[0.06] px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6B7280] dark:text-[#8E8E93]" />
                </button>
              )}
              <div>
                <h2 className="text-[17px] font-semibold text-[#111827] dark:text-[#F2F2F7]">
                  {step === 1 ? 'Ajouter un Congé' : 'Autorisation'}
                </h2>
                {step === 1 && employee && (
                  <p className="text-xs text-gray-500 dark:text-[#8E8E93] mt-1">
                    {employee.name} · {employee.matricule}
                  </p>
                )}
                {step === 2 && startDate && endDate && (
                  <p className="text-xs text-gray-500 dark:text-[#8E8E93] mt-1">
                    {format(startDate, 'd', { locale: fr })}–{format(endDate, 'd MMM', { locale: fr })} · {workingDays} jours · {reason}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-[#8E8E93] text-xs rounded-full px-2 py-0.5">
              Étape {step} / 2
            </span>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#6B7280] dark:text-[#8E8E93]" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {step === 1 ? (
            <>
              {/* Two-Month Calendar */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#F2F2F7] mb-3">
                  Dates du congé
                </label>

                {/* CURRENT MONTH */}
                <div className="mb-4">
                  <div className="text-[11px] uppercase font-semibold mb-2 tracking-wider text-[#6B7280] dark:text-[#636366]">
                    {format(currentMonthObj, 'MMMM', { locale: fr })}
                  </div>

                  <div
                    className="rounded-xl overflow-hidden bg-white dark:bg-[#1C1C28]"
                    style={isDark ? {
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.4)'
                    } : {
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Day headers */}
                    <div
                      className="grid grid-cols-7 bg-[#FAFAFA] dark:bg-white/[0.04]"
                      style={{
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                        <div
                          key={i}
                          className="h-8 flex items-center justify-center text-[10px] font-semibold text-gray-600 dark:text-[#8E8E93] uppercase"
                          style={{
                            letterSpacing: '0.5px',
                            borderRight: i < 6 ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)') : 'none'
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Day cells grid */}
                    <div className="grid grid-cols-7">
                      {currentMonthDays.map((day, i) => {
                        // Empty cell for padding
                        if (!day) {
                          return <div key={i} className="w-full aspect-square" />
                        }

                        const dayStr = day.toISOString().split('T')[0]
                        const isWeekend = day.getDay() === 5 || day.getDay() === 6
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
                        const isExisting = existingDates.has(dayStr)
                        const isStart = startDate && day.toDateString() === startDate.toDateString()
                        const isEnd = endDate && day.toDateString() === endDate.toDateString()
                        const isInRange = startDate && endDate && day > startDate && day < endDate
                        const isCurrentMonth = isSameMonth(day, currentMonthObj)

                        // Grid positioning
                        const col = i % 7
                        const isLastCol = col === 6
                        const isLastRow = i >= currentMonthDays.length - 7

                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isToday = isSameDay(day, today)

                        let cellStyle = {
                          borderRight: !isLastCol ? (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)') : 'none',
                          borderBottom: !isLastRow ? (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)') : 'none',
                        }
                        let textClass = 'w-full aspect-square flex items-center justify-center transition-all duration-150 rounded-lg'

                        // APPLE-STYLE SHINY GRADIENT COLORS
                        if (isExisting) {
                          cellStyle.background = 'linear-gradient(145deg, rgba(255,59,48,0.12), rgba(192,57,43,0.08))'
                          cellStyle.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 1px rgba(255,59,48,0.18)'
                          textClass += ' text-[#C0392B] font-semibold cursor-not-allowed'
                        } else if (isStart || isEnd) {
                          cellStyle.background = 'linear-gradient(145deg, #007AFF, #0055D4)'
                          cellStyle.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(0,122,255,0.35)'
                          textClass += ' text-white font-bold'
                        } else if (isInRange) {
                          cellStyle.background = 'linear-gradient(145deg, rgba(0,122,255,0.1), rgba(0,122,255,0.06))'
                          cellStyle.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,122,255,0.15)'
                          textClass += ' text-[#0055D4] font-medium'
                        } else if (isWeekend) {
                          cellStyle.background = isDark ? 'rgba(255,255,255,0.02)' : '#F2F2F7'
                          cellStyle.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'
                          textClass += ' text-[#C7C7CC] cursor-not-allowed'
                        } else if (isToday && !isStart && !isEnd) {
                          cellStyle.background = 'linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))'
                          cellStyle.boxShadow = '0 0 0 1.5px #007AFF, inset 0 1px 0 rgba(255,255,255,0.9)'
                          textClass += ' text-[#007AFF] font-semibold'
                        } else if (isPast) {
                          cellStyle.background = 'transparent'
                          cellStyle.opacity = 0.6
                          textClass += ' text-[#C7C7CC] cursor-not-allowed'
                        } else {
                          cellStyle.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)'
                          cellStyle.boxShadow = isDark ? 'inset 0 1px 1px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.04)' : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)'
                          textClass += isDark ? ' text-[#C7C7CC] hover:bg-white/[0.06]' : ' text-[#374151] hover:bg-[#F2F2F7]'
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handleDayClick(day)}
                            disabled={isWeekend || isPast || isExisting}
                            className={textClass}
                            style={{
                              fontSize: '13px',
                              ...cellStyle
                            }}
                          >
                            {format(day, 'd')}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* SEPARATOR */}
                <div className="w-full h-px my-4 bg-[#E5E5EA] dark:bg-white/[0.06]" />

                {/* NEXT MONTH */}
                <div className="mb-3">
                  <div className="text-[11px] uppercase font-semibold mb-2 tracking-wider text-[#6B7280] dark:text-[#636366]">
                    {format(nextMonthObj, 'MMMM', { locale: fr })}
                  </div>

                  <div
                    className="rounded-xl overflow-hidden bg-white dark:bg-[#1C1C28]"
                    style={isDark ? {
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.4)'
                    } : {
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'
                    }}
                  >
                    {/* Day headers */}
                    <div
                      className="grid grid-cols-7 bg-[#FAFAFA] dark:bg-white/[0.04]"
                      style={{
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)'
                      }}
                    >
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                        <div
                          key={i}
                          className="h-8 flex items-center justify-center text-[10px] font-semibold text-gray-600 dark:text-[#8E8E93] uppercase"
                          style={{
                            letterSpacing: '0.5px',
                            borderRight: i < 6 ? (isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)') : 'none'
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Day cells grid */}
                    <div className="grid grid-cols-7">
                      {nextMonthDays.map((day, i) => {
                        // Empty cell for padding
                        if (!day) {
                          return <div key={i} className="w-full aspect-square" />
                        }

                        const dayStr = day.toISOString().split('T')[0]
                        const isWeekend = day.getDay() === 5 || day.getDay() === 6
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
                        const isExisting = existingDates.has(dayStr)
                        const isStart = startDate && day.toDateString() === startDate.toDateString()
                        const isEnd = endDate && day.toDateString() === endDate.toDateString()
                        const isInRange = startDate && endDate && day > startDate && day < endDate
                        const isCurrentMonth = isSameMonth(day, nextMonthObj)

                        // Grid positioning
                        const col = i % 7
                        const isLastCol = col === 6
                        const isLastRow = i >= nextMonthDays.length - 7

                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isToday = isSameDay(day, today)

                        let cellStyle = {
                          borderRight: !isLastCol ? (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)') : 'none',
                          borderBottom: !isLastRow ? (isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)') : 'none',
                        }
                        let textClass = 'w-full aspect-square flex items-center justify-center transition-all duration-150 rounded-lg'

                        // APPLE-STYLE SHINY GRADIENT COLORS
                        if (isExisting) {
                          cellStyle.background = 'linear-gradient(145deg, rgba(255,59,48,0.12), rgba(192,57,43,0.08))'
                          cellStyle.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 1px rgba(255,59,48,0.18)'
                          textClass += ' text-[#C0392B] font-semibold cursor-not-allowed'
                        } else if (isStart || isEnd) {
                          cellStyle.background = 'linear-gradient(145deg, #007AFF, #0055D4)'
                          cellStyle.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(0,122,255,0.35)'
                          textClass += ' text-white font-bold'
                        } else if (isInRange) {
                          cellStyle.background = 'linear-gradient(145deg, rgba(0,122,255,0.1), rgba(0,122,255,0.06))'
                          cellStyle.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,122,255,0.15)'
                          textClass += ' text-[#0055D4] font-medium'
                        } else if (isWeekend) {
                          cellStyle.background = isDark ? 'rgba(255,255,255,0.02)' : '#F2F2F7'
                          cellStyle.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.04)'
                          textClass += ' text-[#C7C7CC] cursor-not-allowed'
                        } else if (isToday && !isStart && !isEnd) {
                          cellStyle.background = 'linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))'
                          cellStyle.boxShadow = '0 0 0 1.5px #007AFF, inset 0 1px 0 rgba(255,255,255,0.9)'
                          textClass += ' text-[#007AFF] font-semibold'
                        } else if (isPast) {
                          cellStyle.background = 'transparent'
                          cellStyle.opacity = 0.6
                          textClass += ' text-[#C7C7CC] cursor-not-allowed'
                        } else {
                          cellStyle.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)'
                          cellStyle.boxShadow = isDark ? 'inset 0 1px 1px rgba(255,255,255,0.06), 0 0 0 1px rgba(255,255,255,0.04)' : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)'
                          textClass += isDark ? ' text-[#C7C7CC] hover:bg-white/[0.06]' : ' text-[#374151] hover:bg-[#F2F2F7]'
                        }

                        return (
                          <button
                            key={i}
                            onClick={() => handleDayClick(day)}
                            disabled={isWeekend || isPast || isExisting}
                            className={textClass}
                            style={{
                              fontSize: '13px',
                              ...cellStyle
                            }}
                          >
                            {format(day, 'd')}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Summary chip */}
                {startDate && endDate && (
                  <div className="bg-navy/5 dark:bg-[#2C4A6F]/10 border border-navy/10 dark:border-[#2C4A6F]/20 rounded-xl p-3">
                    <div className="text-sm font-semibold text-navy dark:text-[#5E9FFF]">
                      {workingDays} jours ouvrables · {totalCalendarDays} jours calendaires
                    </div>
                  </div>
                )}

                {/* Sandwich warning */}
                {hasSandwich && (
                  <div className="flex gap-2 p-3 bg-status-amber/10 dark:bg-[rgba(255,159,10,0.15)] border border-status-amber/20 dark:border-[rgba(255,159,10,0.2)] rounded-xl mt-2">
                    <AlertTriangle className="w-4 h-4 text-status-amber dark:text-[#FF9F0A] flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-status-amber dark:text-[#FF9F0A]">
                      ⚠ Détection sandwich — Jours réels: {totalCalendarDays} · Déclarés: {workingDays}
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#F2F2F7] mb-2">
                  Pièce justificative
                  <span className="text-[#6B7280] dark:text-[#8E8E93] font-normal ml-1">(optionnel)</span>
                </label>

                {uploadedFile ? (
                  <div className="flex items-center justify-between p-3 bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-navy dark:text-[#5E9FFF]" />
                      <div>
                        <div className="text-sm font-medium text-[#111827] dark:text-[#F2F2F7]">{uploadedFile.name}</div>
                        <div className="text-xs text-[#6B7280] dark:text-[#8E8E93]">
                          {(uploadedFile.size / 1024).toFixed(0)} Ko
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-sm text-status-red dark:text-[#FF6B6B] hover:underline"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-warm-gray-400 dark:border-white/[0.12] rounded-xl p-6 text-center cursor-pointer hover:border-navy/40 dark:hover:border-[#2C4A6F]/40 transition-colors">
                    <Upload className="w-8 h-8 text-[#6B7280] dark:text-[#636366] mx-auto mb-2" />
                    <div className="text-sm text-[#6B7280] dark:text-[#636366]">
                      Glisser ou cliquer
                    </div>
                    <div className="text-xs text-[#9CA3AF] dark:text-[#636366] mt-1">
                      PDF, JPG, PNG · max 5 Mo
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </label>
                )}
              </div>

              {/* Reason Selector */}
              <div ref={typeSelectRef}>
                <CustomSelect
                  label="Type de congé"
                  required
                  value={reason}
                  onChange={(value) => setReason(value)}
                  placeholder="Sélectionnez un type"
                  options={[
                    { value: 'Congé annuel', label: 'Congé annuel' },
                    { value: 'Congé maladie', label: 'Congé maladie' },
                    { value: 'Congé sans solde', label: 'Congé sans solde' },
                    { value: 'Autre', label: 'Autre' },
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
          ) : (
            <AutorisationStep
              admins={admins}
              selectedAdmin={selectedAdmin}
              onAdminSelect={(admin) => setSelectedAdmin(admin)}
              pin={pin}
              onPinChange={handlePinChange}
              pinStatus={pinStatus}
              pinIdPrefix="pin"
            />
          )}

          {/* Extra padding at bottom so last field not hidden */}
          <div className="h-6" />
        </div>

        {/* STICKY FOOTER */}
        <div className="flex-shrink-0 bg-white dark:bg-[#16161E] border-t border-gray-100 dark:border-white/[0.06] px-5 py-4 flex gap-3">
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#8E8E93] hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all duration-200"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            style={
              (step === 1 ? isStep1Valid : isStep2Valid)
                ? (isDark ? {
                    background: 'linear-gradient(145deg, #1A2F4F, #0F1F35)',
                    color: 'white',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
                  } : {
                    backgroundColor: '#1A2F4F',
                    color: 'white'
                  })
                : {
                    backgroundColor: '#9CA3AF',
                    color: 'white'
                  }
            }
            onMouseEnter={(e) => {
              if ((step === 1 ? isStep1Valid : isStep2Valid)) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,47,79,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if ((step === 1 ? isStep1Valid : isStep2Valid)) {
                e.currentTarget.style.boxShadow = isDark
                  ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
                  : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
              }
            }}
          >
            {step === 1 ? 'Suivant →' : 'Confirmer le congé'}
          </button>
        </div>
      </div>
    </div>
  )
}

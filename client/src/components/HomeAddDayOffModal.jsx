import { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Upload, Search, ChevronLeft, Check, AlertTriangle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEmployees } from '../hooks/useEmployees'
import { useDaysOff } from '../hooks/useDaysOff'
import { useAdmins, useAdminPin } from '../hooks/useAdmins'
import CustomSelect from './CustomSelect'

export default function HomeAddDayOffModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)

  // Step 1: Employee selection
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // Step 2: Dates and reason
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [reason, setReason] = useState('')

  // Step 3: Admin authorization
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle')
  const typeSelectRef = useRef(null)

  const { employees, loading } = useEmployees()
  const { daysOff, addDayOff } = useDaysOff({ employeeId: selectedEmployee?.id })
  const { admins: rawAdmins, loading: adminsLoading } = useAdmins()
  const { verify: verifyPin } = useAdminPin()

  // Transform admins to add initials
  const admins = useMemo(() => {
    return rawAdmins.map(admin => ({
      ...admin,
      initials: admin.name
        .split(' ')
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    }))
  }, [rawAdmins])

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

  // Generate calendar days for BOTH months (current + next)
  const { currentMonthDays, nextMonthDays, currentMonthObj, nextMonthObj } = useMemo(() => {
    const today = new Date()
    const currentMonthObj = new Date(today.getFullYear(), today.getMonth(), 1)
    const nextMonthObj = addMonths(currentMonthObj, 1)

    // Generate days for current month
    const currentMonthStart = startOfMonth(currentMonthObj)
    const currentMonthEnd = endOfMonth(currentMonthObj)
    const currentDays = eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd })

    // Pad start of current month with previous month days
    const currentStartDayOfWeek = currentMonthStart.getDay()
    const currentDaysToAdd = currentStartDayOfWeek === 0 ? 6 : currentStartDayOfWeek - 1
    const prevMonthEnd = endOfMonth(subMonths(currentMonthObj, 1))
    for (let i = currentDaysToAdd - 1; i >= 0; i--) {
      const day = new Date(prevMonthEnd)
      day.setDate(prevMonthEnd.getDate() - i)
      currentDays.unshift(day)
    }

    // Generate days for next month
    const nextMonthStart = startOfMonth(nextMonthObj)
    const nextMonthEnd = endOfMonth(nextMonthObj)
    const nextDays = eachDayOfInterval({ start: nextMonthStart, end: nextMonthEnd })

    // Pad start of next month with current month days
    const nextStartDayOfWeek = nextMonthStart.getDay()
    const nextDaysToAdd = nextStartDayOfWeek === 0 ? 6 : nextStartDayOfWeek - 1
    const currentMonthEndDate = endOfMonth(currentMonthObj)
    for (let i = nextDaysToAdd - 1; i >= 0; i--) {
      const day = new Date(currentMonthEndDate)
      day.setDate(currentMonthEndDate.getDate() - i)
      nextDays.unshift(day)
    }

    return {
      currentMonthDays: currentDays,
      nextMonthDays: nextDays,
      currentMonthObj,
      nextMonthObj
    }
  }, [])

  if (!isOpen) return null

  console.log('🔍 MODAL DEBUG:', {
    step,
    adminsCount: admins.length,
    adminsLoading,
    selectedAdmin: selectedAdmin?.id,
    selectedAdminName: selectedAdmin?.name
  })

  const handleClose = () => {
    setStep(1)
    setSearchQuery('')
    setSelectedEmployee(null)
    setStartDate(null)
    setEndDate(null)
    setUploadedFile(null)
    setReason('')
    setSelectedAdmin(null)
    setPin(['', '', '', ''])
    setPinStatus('idle')
    onClose?.()
  }

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
      document.getElementById(`home-pin-${index + 1}`)?.focus()
    }

    // Auto-verify when all 4 digits entered
    if (newPin.every(d => d !== '')) {
      handlePinValidate(newPin.join(''))
    }
  }

  const handlePinValidate = async (pinValue) => {
    if (!selectedAdmin?.id) {
      console.error('❌ No admin selected')
      return
    }

    console.log('🔐 Validating PIN for admin:', selectedAdmin.id)
    setPinStatus('verifying')

    try {
      await verifyPin(selectedAdmin.id, pinValue)
      console.log('✅ PIN verified successfully')
      setPinStatus('verified')
    } catch (error) {
      console.error('❌ PIN verification failed:', error)
      setPinStatus('error')
      setTimeout(() => {
        setPin(['', '', '', ''])
        setPinStatus('idle')
        document.getElementById('home-pin-0')?.focus()
      }, 1500)
    }
  }

  const handleFinalSubmit = async () => {
    if (!selectedEmployee || !startDate || !endDate || !reason || pinStatus !== 'verified') return

    try {
      await addDayOff({
        employeeId: selectedEmployee.id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason,
        document: uploadedFile,
        adminId: selectedAdmin?.id || 1,
      })

      onSuccess?.()
      handleClose()
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

  const isStep1Valid = !!selectedEmployee
  const isStep2Valid = !!startDate && !!endDate && !!reason
  const isStep3Valid = !!selectedAdmin && pinStatus === 'verified'

  const getStatusConfig = (status) => {
    const configs = {
      actif: { label: t('actif'), dotColor: 'bg-status-green', bgColor: 'bg-status-green/10', textColor: 'text-status-green' },
      risque: { label: t('aRisqueStatus'), dotColor: 'bg-status-amber', bgColor: 'bg-status-amber/10', textColor: 'text-status-amber' },
      bloqué: { label: t('bloque'), dotColor: 'bg-status-red', bgColor: 'bg-status-red/10', textColor: 'text-status-red' },
    }
    return configs[status] || configs.actif
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col h-[92vh] sm:max-h-[88vh] overflow-hidden"
        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)' }}
      >
        {/* STICKY HEADER */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
            )}
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827]">
                {t('ajouterConge')}
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {t('etape')} {step} {t('sur')} 3 — {
                  step === 1 ? t('choisirEmploye') :
                  step === 2 ? t('datesEtMotif') :
                  t('autorisation')
                }
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
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5">
          {step === 1 && (
            <>
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('rechercherMatricule')}
                  autoFocus
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[rgba(118,118,128,0.08)] border-0 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
                  style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)' }}
                />
              </div>

              {/* Employee list */}
              <div className="space-y-2">
                {loading ? (
                  // Skeleton loading
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-warm-gray-200">
                      <div className="w-8 h-8 rounded-full bg-warm-gray-300" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-warm-gray-300 rounded w-1/2" />
                        <div className="h-3 bg-warm-gray-300 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <div className="py-8 text-center text-[#6B7280]">
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
                            ? 'border-navy bg-navy/5'
                            : 'border-transparent bg-warm-gray-200 hover:bg-black/[0.02]'
                        }`}
                        style={isSelected ? { borderLeft: '2px solid #1B3A6B' } : {}}
                      >
                        <div className="w-8 h-8 rounded-full bg-warm-gray-300 flex items-center justify-center text-xs font-semibold text-[#374151]">
                          {emp.avatar}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-semibold text-sm text-[#111827] truncate">
                            {emp.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono text-[#6B7280]">{emp.matricule}</span>
                            <span className="px-2 py-0.5 bg-warm-gray-300 text-[#374151] text-[10px] rounded-md">
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

              {/* Selected employee preview */}
              {selectedEmployee && (
                <div className="bg-warm-gray-200 rounded-xl p-4" style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-warm-gray-300 flex items-center justify-center text-sm font-semibold text-[#374151]">
                      {selectedEmployee.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-[#111827]">
                        {selectedEmployee.name}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {selectedEmployee.matricule} · {selectedEmployee.department}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white rounded-lg px-2 py-1.5 text-center">
                      <div className="text-xs text-[#6B7280]">{t('joursConge')}</div>
                      <div className="text-sm font-bold text-navy">{selectedEmployee.daysUsed || 0}</div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-2 py-1.5 text-center">
                      <div className="text-xs text-[#6B7280]">{t('joursTravailles')}</div>
                      <div className="text-sm font-bold text-navy">
                        {30 - (selectedEmployee.daysUsed || 0)}
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-2 py-1.5 text-center">
                      <div className="text-xs text-[#6B7280]">{t('joursDisponibles')}</div>
                      <div className="text-sm font-bold text-navy">
                        {selectedEmployee.daysTotal - selectedEmployee.daysUsed}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* Two-Month Calendar */}
              <div>
                {/* CURRENT MONTH */}
                <div className="mb-4">
                  <div
                    className="text-[11px] uppercase font-semibold mb-2 tracking-wider"
                    style={{ color: '#6B7280' }}
                  >
                    {format(currentMonthObj, 'MMMM', { locale: fr })}
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
                    background: '#FFFFFF'
                  }}>
                    {/* Day headers */}
                    <div className="grid grid-cols-7" style={{
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      background: '#FAFAFA'
                    }}>
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                        <div
                          key={i}
                          className="h-8 flex items-center justify-center text-[10px] font-semibold text-gray-600 uppercase"
                          style={{
                            letterSpacing: '0.5px',
                            borderRight: i < 6 ? '1px solid rgba(0,0,0,0.04)' : 'none'
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Day cells grid */}
                    <div className="grid grid-cols-7">
                      {currentMonthDays.map((day, i) => {
                        const dayStr = day.toISOString().split('T')[0]
                        const isWeekend = day.getDay() === 5 || day.getDay() === 6
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isPast = day < today
                        const isExisting = existingDates.has(dayStr)
                        const isStart = startDate && day.toDateString() === startDate.toDateString()
                        const isEnd = endDate && day.toDateString() === endDate.toDateString()
                        const isInRange = startDate && endDate && day > startDate && day < endDate
                        const isCurrentMonth = isSameMonth(day, currentMonthObj)
                        const isToday = isSameDay(day, today)

                        // Grid positioning
                        const col = i % 7
                        const isLastCol = col === 6
                        const isLastRow = i >= currentMonthDays.length - 7

                        let cellStyle = {
                          borderRight: !isLastCol ? '1px solid rgba(0,0,0,0.06)' : 'none',
                          borderBottom: !isLastRow ? '1px solid rgba(0,0,0,0.06)' : 'none',
                        }
                        let textClass = 'w-full aspect-square flex items-center justify-center transition-all duration-150 rounded-lg'

                        if (!isCurrentMonth) {
                          textClass += ' opacity-40'
                        }

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
                          cellStyle.background = '#F2F2F7'
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
                          cellStyle.background = 'rgba(255,255,255,0.8)'
                          cellStyle.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)'
                          textClass += ' text-[#374151] hover:bg-[#F2F2F7]'
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
                <div className="w-full h-px my-4" style={{ background: '#E5E5EA' }} />

                {/* NEXT MONTH */}
                <div className="mb-3">
                  <div
                    className="text-[11px] uppercase font-semibold mb-2 tracking-wider"
                    style={{ color: '#6B7280' }}
                  >
                    {format(nextMonthObj, 'MMMM', { locale: fr })}
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
                    background: '#FFFFFF'
                  }}>
                    {/* Day headers */}
                    <div className="grid grid-cols-7" style={{
                      borderBottom: '1px solid rgba(0,0,0,0.08)',
                      background: '#FAFAFA'
                    }}>
                      {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                        <div
                          key={i}
                          className="h-8 flex items-center justify-center text-[10px] font-semibold text-gray-600 uppercase"
                          style={{
                            letterSpacing: '0.5px',
                            borderRight: i < 6 ? '1px solid rgba(0,0,0,0.04)' : 'none'
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Day cells grid */}
                    <div className="grid grid-cols-7">
                      {nextMonthDays.map((day, i) => {
                        const dayStr = day.toISOString().split('T')[0]
                        const isWeekend = day.getDay() === 5 || day.getDay() === 6
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isPast = day < today
                        const isExisting = existingDates.has(dayStr)
                        const isStart = startDate && day.toDateString() === startDate.toDateString()
                        const isEnd = endDate && day.toDateString() === endDate.toDateString()
                        const isInRange = startDate && endDate && day > startDate && day < endDate
                        const isCurrentMonth = isSameMonth(day, nextMonthObj)
                        const isToday = isSameDay(day, today)

                        // Grid positioning
                        const col = i % 7
                        const isLastCol = col === 6
                        const isLastRow = i >= nextMonthDays.length - 7

                        let cellStyle = {
                          borderRight: !isLastCol ? '1px solid rgba(0,0,0,0.06)' : 'none',
                          borderBottom: !isLastRow ? '1px solid rgba(0,0,0,0.06)' : 'none',
                        }
                        let textClass = 'w-full aspect-square flex items-center justify-center transition-all duration-150 rounded-lg'

                        if (!isCurrentMonth) {
                          textClass += ' opacity-40'
                        }

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
                          cellStyle.background = '#F2F2F7'
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
                          cellStyle.background = 'rgba(255,255,255,0.8)'
                          cellStyle.boxShadow = 'inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)'
                          textClass += ' text-[#374151] hover:bg-[#F2F2F7]'
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
              </div>

              {/* Date summary */}
              {startDate && endDate && (
                <div className="bg-navy/5 rounded-xl p-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <div className="text-[#6B7280] text-xs">{t('dateDebut')}</div>
                      <div className="font-semibold text-navy">
                        {format(startDate, 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                    <div className="text-[#6B7280]">→</div>
                    <div>
                      <div className="text-[#6B7280] text-xs">{t('dateFin')}</div>
                      <div className="font-semibold text-navy">
                        {format(endDate, 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs">
                    <div>
                      <span className="font-bold text-navy">{workingDays}</span> {t('joursOuvrables')}
                    </div>
                    <div>
                      <span className="font-bold text-navy">{totalCalendarDays}</span> {t('joursCalendaires')}
                    </div>
                    {hasSandwich && (
                      <div className="flex items-center gap-1 text-status-amber">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="font-medium">{t('sandwichDetection')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  {t('pieceJustificative')}
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-warm-gray-400 rounded-xl cursor-pointer hover:bg-warm-gray-200 transition-colors">
                  <Upload className="w-6 h-6 text-[#6B7280] mb-2" />
                  <span className="text-xs text-[#6B7280]">
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

          {step === 3 && (
            <>
              {/* Summary */}
              <div className="bg-warm-gray-200 rounded-xl p-4">
                <div className="text-sm font-medium text-[#111827]">
                  {selectedEmployee?.name} · {startDate && endDate && `${format(startDate, 'dd MMM', { locale: fr })}–${format(endDate, 'dd MMM', { locale: fr })}`} · {workingDays} {t('jours')} · {reason === 'annual' ? t('congeAnnuel') : reason === 'sick' ? t('congeMaladie') : reason === 'unpaid' ? t('congeSansSolde') : t('autre')}
                </div>
              </div>

              {/* Admin selector */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  {t('administrateur')}
                </label>

                {/* DEBUG INFO */}
                <div className="mb-2 p-2 bg-yellow-100 text-xs rounded">
                  <div>Admins loaded: {admins.length}</div>
                  <div>Selected: {selectedAdmin?.name || 'None'} ({selectedAdmin?.id || 'No ID'})</div>
                  <div>Loading: {adminsLoading ? 'Yes' : 'No'}</div>
                </div>

                <div className="space-y-2">
                  {adminsLoading && (
                    <div className="text-sm text-gray-500">Chargement des administrateurs...</div>
                  )}

                  {!adminsLoading && admins.length === 0 && (
                    <div className="text-sm text-red-500">Aucun administrateur trouvé</div>
                  )}

                  {!adminsLoading && admins.map(admin => {
                    const isSelected = selectedAdmin?.id === admin.id
                    console.log(`🎨 Rendering admin ${admin.name} (${admin.id}): selected=${isSelected}, selectedAdminId=${selectedAdmin?.id}`)

                    return (
                      <button
                        type="button"
                        key={admin.id}
                        onClick={() => {
                          console.log('🖱️ Admin clicked:', admin.id, admin.name)
                          console.log('🖱️ Currently selected:', selectedAdmin?.id)

                          if (selectedAdmin?.id === admin.id) {
                            console.log('⚠️ Already selected, ignoring click')
                            return
                          }

                          console.log('✅ Selecting admin:', admin.id)
                          setSelectedAdmin(admin)
                          setPin(['', '', '', ''])
                          setPinStatus('idle')
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-navy bg-navy/10 shadow-sm'
                            : 'border-warm-gray-400 hover:border-navy/40'
                        }`}
                      >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        isSelected ? 'bg-navy text-white' : 'bg-navy/10 text-navy'
                      }`}>
                        {admin.initials}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-[#111827]">{admin.name}</div>
                        <div className="text-xs text-[#6B7280]">{admin.role}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-navy" />
                      )}
                    </button>
                    )
                  })}
                </div>
              </div>

              {/* PIN input */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  {t('codePIN')}
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(index => (
                    <input
                      key={index}
                      id={`home-pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={pin[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      disabled={!selectedAdmin || pinStatus === 'verifying' || pinStatus === 'verified'}
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
                {!selectedAdmin && (
                  <p className="text-xs text-[#6B7280] text-center mt-2">
                    {t('selectionnerAdminDabord')}
                  </p>
                )}
                {pinStatus === 'verifying' && (
                  <p className="text-xs text-navy text-center mt-2">{t('verification')}</p>
                )}
                {pinStatus === 'error' && (
                  <p className="text-xs text-status-red text-center mt-2">{t('codeIncorrect')}</p>
                )}
                {pinStatus === 'verified' && (
                  <p className="text-xs text-status-green text-center mt-2">{t('codeCorrect')}</p>
                )}
              </div>
            </>
          )}

          {/* Extra padding at bottom */}
          <div className="h-6" />
        </div>

        {/* STICKY FOOTER */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-white">
          <button
            onClick={step === 1 ? handleClose : () => setStep(step - 1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all"
          >
            {step === 1 ? t('annuler') : t('retourFleche')}
          </button>
          <button
            onClick={step === 3 ? handleFinalSubmit : () => setStep(step + 1)}
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 3 && !isStep3Valid)
            }
            className="flex-1 ml-3 bg-navy text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 3 ? t('confirmerConge') : t('suivantFleche')}
          </button>
        </div>
      </div>
    </div>
  )
}

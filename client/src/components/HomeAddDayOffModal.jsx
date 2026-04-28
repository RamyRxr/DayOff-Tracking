import { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Upload, Search, ChevronLeft, AlertTriangle } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useEmployees } from '../hooks/useEmployees'
import { useDaysOff } from '../hooks/useDaysOff'
import { useAdmins, useAdminPin } from '../hooks/useAdmins'
import { useTheme } from '../contexts/ThemeContext'
import CustomSelect from './CustomSelect'
import AutorisationStep from './AutorisationStep'
import SplitCalendar from './SplitCalendar'

export default function HomeAddDayOffModal({ isOpen, onClose, onSuccess }) {
  const { t } = useTranslation()
  const { isDark } = useTheme()
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

  // Custom cell renderer for range selection
  const renderCalendarCell = (day, index, { isDark: _, cellSizeClass = 'w-9 h-9', textSizeClass = 'text-[13px]' } = {}) => {
    const dayStr = day.toISOString().split('T')[0]
    const isWeekend = day.getDay() === 5 || day.getDay() === 6
    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
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
    } else if (isPast) {
      cellStyle.background = 'transparent'
      cellStyle.opacity = 0.6
      textClass += isDark ? ' text-[#4A6A8A] cursor-not-allowed' : ' text-[#C7C7CC] cursor-not-allowed'
    } else {
      cellStyle.background = isDark ? 'rgba(99,157,255,0.05)' : 'rgba(255,255,255,0.8)'
      cellStyle.boxShadow = isDark ? 'inset 0 1px 1px rgba(255,255,255,0.04), 0 0 0 1px rgba(99,157,255,0.08)' : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)'
      textClass += isDark ? ' text-[#7A9CC4] hover:bg-white/[0.06]' : ' text-[#374151] hover:bg-[#F2F2F7]'
    }

    return (
      <button
        key={index}
        onClick={() => handleDayClick(day)}
        disabled={isWeekend || isPast || isExisting}
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

              {/* Selected employee preview */}
              {selectedEmployee && (
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
                  <div className="flex items-center gap-3 mb-3">
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
                  <div className="flex gap-2">
                    <div
                      className="flex-1 bg-white dark:bg-[#1C1C28] rounded-lg px-2 py-1.5 text-center"
                      style={isDark ? {
                        backgroundColor: 'rgba(13,21,38,0.6)',
                        border: '1px solid rgba(99,157,255,0.12)'
                      } : {}}
                    >
                      <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{t('joursConge')}</div>
                      <div className="text-sm font-bold text-navy dark:text-[#639DFF]">{selectedEmployee.daysUsed || 0}</div>
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
                        {30 - (selectedEmployee.daysUsed || 0)}
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

          {step === 3 && (
            <>
              {/* Summary */}
              <div
                className="bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl p-4"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.08)',
                  border: '1px solid rgba(99,157,255,0.12)'
                } : {}}
              >
                <div className="text-sm font-medium text-[#111827] dark:text-[#E8EFF8]">
                  {selectedEmployee?.name} · {startDate && endDate && `${format(startDate, 'dd MMM', { locale: fr })}–${format(endDate, 'dd MMM', { locale: fr })}`} · {workingDays} {t('jours')} · {reason === 'annual' ? t('congeAnnuel') : reason === 'sick' ? t('congeMaladie') : reason === 'unpaid' ? t('congeSansSolde') : t('autre')}
                </div>
              </div>

              <AutorisationStep
                admins={admins}
                selectedAdmin={selectedAdmin}
                onAdminSelect={(admin) => {
                  setSelectedAdmin(admin)
                  setPin(['', '', '', ''])
                  setPinStatus('idle')
                }}
                pin={pin}
                onPinChange={handlePinChange}
                pinStatus={pinStatus}
                pinIdPrefix="home-pin"
              />
            </>
          )}

          {/* Extra padding at bottom */}
          <div className="h-6" />
        </div>

        {/* STICKY FOOTER */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#16161E]"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <button
            onClick={step === 1 ? handleClose : () => setStep(step - 1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#7A9CC4] hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all duration-200"
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
            {step === 1 ? t('annuler') : t('retourFleche')}
          </button>
          <button
            onClick={step === 3 ? handleFinalSubmit : () => setStep(step + 1)}
            disabled={
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 3 && !isStep3Valid)
            }
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            style={
              ((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid) || (step === 3 && isStep3Valid))
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
            onMouseEnter={(e) => {
              if ((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid) || (step === 3 && isStep3Valid)) {
                if (!isDark) {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,47,79,0.3)'
                }
              }
            }}
            onMouseLeave={(e) => {
              if ((step === 1 && isStep1Valid) || (step === 2 && isStep2Valid) || (step === 3 && isStep3Valid)) {
                e.currentTarget.style.boxShadow = isDark
                  ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.5)'
                  : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
              }
            }}
          >
            {step === 3 ? t('confirmerConge') : t('suivantFleche')}
          </button>
        </div>
      </div>
    </div>
  )
}

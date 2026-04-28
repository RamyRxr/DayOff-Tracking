import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, Upload, AlertTriangle, ChevronLeft } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useDaysOff } from '../hooks/useDaysOff'
import { useTheme } from '../contexts/ThemeContext'
import CustomSelect from './CustomSelect'
import AutorisationStep from './AutorisationStep'
import SplitCalendar from './SplitCalendar'

export default function AddDayOffModal({ employee, isOpen, onClose, onSubmit }) {
  const { t } = useTranslation()
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
          className="flex-shrink-0 bg-white dark:bg-[#16161E] border-b border-gray-100 dark:border-white/[0.06] px-5 pt-5 pb-4 flex items-center justify-between"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
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
                <h2 className="text-[17px] font-semibold text-[#111827] dark:text-[#E8EFF8]">
                  {step === 1 ? t('ajouterCongeTitle') : t('autorisationTitle')}
                </h2>
                {step === 1 && employee && (
                  <p className="text-xs text-gray-500 dark:text-[#7A9CC4] mt-1">
                    {employee.name} · {employee.matricule}
                  </p>
                )}
                {step === 2 && startDate && endDate && (
                  <p className="text-xs text-gray-500 dark:text-[#7A9CC4] mt-1">
                    {format(startDate, 'd', { locale: fr })}–{format(endDate, 'd MMM', { locale: fr })} · {workingDays} jours · {reason}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-[#8E8E93] text-xs rounded-full px-2 py-0.5"
              style={isDark ? {
                backgroundColor: 'rgba(99,157,255,0.1)',
                color: '#7A9CC4'
              } : {}}
            >
              Étape {step} / 2
            </span>
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
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          {step === 1 ? (
            <>
              {/* Calendar */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-3">
                  {t('datesConge')}
                </label>

                <SplitCalendar
                  currentPeriod={new Date()}
                  isDark={isDark}
                  renderCell={renderCalendarCell}
                />

                {/* Summary chip */}
                {startDate && endDate && (
                  <div
                    className="bg-navy/5 dark:bg-[#2C4A6F]/10 border border-navy/10 dark:border-[#2C4A6F]/20 rounded-xl p-3 mt-4"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.1)',
                      borderColor: 'rgba(99,157,255,0.2)'
                    } : {}}
                  >
                    <div className="text-sm font-semibold text-navy dark:text-[#639DFF]">
                      {workingDays} {t('joursOuvrablesLong')} · {totalCalendarDays} {t('joursCalendairesLong')}
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
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('pieceJustificative')}
                  <span className="text-[#6B7280] dark:text-[#7A9CC4] font-normal ml-1">({t('optionnel')})</span>
                </label>

                {uploadedFile ? (
                  <div
                    className="flex items-center justify-between p-3 bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.08)',
                      border: '1px solid rgba(99,157,255,0.12)'
                    } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-navy dark:text-[#639DFF]" />
                      <div>
                        <div className="text-sm font-medium text-[#111827] dark:text-[#E8EFF8]">{uploadedFile.name}</div>
                        <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">
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
                  <label
                    className="block border-2 border-dashed border-warm-gray-400 dark:border-white/[0.12] rounded-xl p-6 text-center cursor-pointer hover:border-navy/40 dark:hover:border-[#2C4A6F]/40 transition-colors"
                    style={isDark ? {
                      borderColor: 'rgba(99,157,255,0.2)'
                    } : {}}
                  >
                    <Upload className="w-8 h-8 text-[#6B7280] dark:text-[#7A9CC4] mx-auto mb-2" />
                    <div className="text-sm text-[#6B7280] dark:text-[#7A9CC4]">
                      Glisser ou cliquer
                    </div>
                    <div className="text-xs text-[#9CA3AF] dark:text-[#7A9CC4] mt-1">
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
                  label={t('typeConge')}
                  required
                  value={reason}
                  onChange={(value) => setReason(value)}
                  placeholder={t('selectionnezType')}
                  options={[
                    { value: t('congeAnnuel'), label: t('congeAnnuel') },
                    { value: t('congeMaladie'), label: t('congeMaladie') },
                    { value: t('congeSansSolde'), label: t('congeSansSolde') },
                    { value: t('autre'), label: t('autre') },
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
        <div
          className="flex-shrink-0 bg-white dark:bg-[#16161E] border-t border-gray-100 dark:border-white/[0.06] px-5 py-4 flex gap-3"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
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
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            style={
              (step === 1 ? isStep1Valid : isStep2Valid)
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
              if ((step === 1 ? isStep1Valid : isStep2Valid) && !isDark) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,47,79,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if ((step === 1 ? isStep1Valid : isStep2Valid)) {
                e.currentTarget.style.boxShadow = isDark
                  ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.5)'
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

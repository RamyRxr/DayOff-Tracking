import { useState, useMemo } from 'react'
import { X, Calendar, Upload, AlertTriangle, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useDaysOff } from '../hooks/useDaysOff'
import CustomSelect from './CustomSelect'

export default function AddDayOffModal({ employee, isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [reason, setReason] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle') // idle | verifying | verified | error

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

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Pad start with previous month days
    const startDayOfWeek = monthStart.getDay()
    const daysToAdd = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1))
    for (let i = daysToAdd - 1; i >= 0; i--) {
      const day = new Date(prevMonthEnd)
      day.setDate(prevMonthEnd.getDate() - i)
      days.unshift(day)
    }

    return days
  }, [currentMonth])

  // Early return AFTER all hooks
  if (!isOpen) return null

  const handleClose = () => {
    setStep(1)
    setStartDate(null)
    setEndDate(null)
    setUploadedFile(null)
    setReason('')
    setSelectedAdmin(null)
    setPin(['', '', '', ''])
    setPinStatus('idle')
    setCurrentMonth(new Date())
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

  const handleSubmit = () => {
    onSubmit?.({
      employeeId: employee.id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      workingDays,
      reason,
      file: uploadedFile,
    })
    handleClose()
  }

  const isStep1Valid = startDate && endDate && reason
  const isStep2Valid = pinStatus === 'verified'

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        style={{
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.16)'
        }}
      >
        {/* Header */}
        <div className="bg-white border-b border-black/6 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {step === 2 && (
                <button
                  onClick={() => setStep(1)}
                  className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
                </button>
              )}
              <div>
                <h2 className="text-[17px] font-semibold text-[#111827]">
                  {step === 1 ? 'Ajouter un Congé' : 'Autorisation'}
                </h2>
                {step === 1 && employee && (
                  <p className="text-xs text-gray-500 mt-1">
                    {employee.name} · {employee.matricule}
                  </p>
                )}
                {step === 2 && startDate && endDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {format(startDate, 'd', { locale: fr })}–{format(endDate, 'd MMM', { locale: fr })} · {workingDays} jours · {reason}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gray-100 text-gray-500 text-xs rounded-full px-2 py-0.5">
              Étape {step} / 2
            </span>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {step === 1 ? (
            <>
              {/* Mini Calendar */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  Dates du congé
                </label>

                {/* Month navigation */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
                  </button>
                  <span className="text-sm font-semibold text-[#111827]">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                  </button>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5 mb-3">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                    <div key={i} className="h-8 flex items-center justify-center text-xs font-medium text-[#6B7280]">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, i) => {
                    const dayStr = day.toISOString().split('T')[0]
                    const isWeekend = day.getDay() === 5 || day.getDay() === 6
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
                    const isExisting = existingDates.has(dayStr)
                    const isStart = startDate && day.toDateString() === startDate.toDateString()
                    const isEnd = endDate && day.toDateString() === endDate.toDateString()
                    const isInRange = startDate && endDate && day > startDate && day < endDate
                    const isCurrentMonth = isSameMonth(day, currentMonth)

                    // Only 3 colors: day-off (red gradient), normal (white-gray), weekend (gray)
                    let cellStyle = {}
                    let textClass = 'text-xs transition-all'

                    if (!isCurrentMonth) {
                      textClass += ' opacity-30'
                    }

                    if (isStart || isEnd || isExisting) {
                      // Selected or existing day-off: red gradient
                      cellStyle = {
                        background: 'linear-gradient(135deg, #FF3B30, #C0392B)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)'
                      }
                      textClass += ' text-white font-semibold'
                      if (isExisting) textClass += ' cursor-not-allowed'
                    } else if (isInRange) {
                      // In range: lighter red with border
                      cellStyle = {
                        background: '#FFE5E5',
                        border: '1px solid #FF3B30',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                      }
                      textClass += ' text-[#C0392B] font-medium'
                    } else if (isWeekend) {
                      // Weekend: gray
                      cellStyle = {
                        background: '#E5E5EA',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                      }
                      textClass += ' text-[#8E8E93] cursor-not-allowed'
                    } else if (isPast) {
                      // Past: white-gray but disabled
                      cellStyle = {
                        background: '#FAFAFA',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                      }
                      textClass += ' text-gray-300 cursor-not-allowed'
                    } else {
                      // Normal selectable: white-gray with hover
                      cellStyle = {
                        background: '#FAFAFA',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                      }
                      textClass += ' text-gray-700 hover:border-[#FF3B30] hover:bg-red-50'
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleDayClick(day)}
                        disabled={isWeekend || isPast || isExisting}
                        className={`rounded-lg ${textClass}`}
                        style={{
                          width: '36px',
                          height: '36px',
                          fontSize: '13px',
                          ...cellStyle
                        }}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>

                {/* Summary chip */}
                {startDate && endDate && (
                  <div className="bg-navy/5 border border-navy/10 rounded-xl p-3">
                    <div className="text-sm font-semibold text-navy">
                      {workingDays} jours ouvrables · {totalCalendarDays} jours calendaires
                    </div>
                  </div>
                )}

                {/* Sandwich warning */}
                {hasSandwich && (
                  <div className="flex gap-2 p-3 bg-status-amber/10 border border-status-amber/20 rounded-xl mt-2">
                    <AlertTriangle className="w-4 h-4 text-status-amber flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-status-amber">
                      ⚠ Détection sandwich — Jours réels: {totalCalendarDays} · Déclarés: {workingDays}
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Pièce justificative
                  <span className="text-[#6B7280] font-normal ml-1">(optionnel)</span>
                </label>

                {uploadedFile ? (
                  <div className="flex items-center justify-between p-3 bg-warm-gray-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-navy" />
                      <div>
                        <div className="text-sm font-medium text-[#111827]">{uploadedFile.name}</div>
                        <div className="text-xs text-[#6B7280]">
                          {(uploadedFile.size / 1024).toFixed(0)} Ko
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-sm text-status-red hover:underline"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-warm-gray-400 rounded-xl p-6 text-center cursor-pointer hover:border-navy/40 transition-colors">
                    <Upload className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
                    <div className="text-sm text-[#6B7280]">
                      Glisser ou cliquer
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-1">
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
              />
            </>
          ) : (
            <>
              {/* Admin Selector */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  Administrateur
                </label>
                <div className="space-y-2">
                  {admins.map(admin => (
                    <button
                      key={admin.id}
                      onClick={() => setSelectedAdmin(admin)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        selectedAdmin?.id === admin.id
                          ? 'border-navy bg-navy/5'
                          : 'border-warm-gray-400 hover:border-navy/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-semibold text-navy">
                        {admin.initials}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-[#111827]">{admin.name}</div>
                        <div className="text-xs text-[#6B7280]">{admin.role}</div>
                      </div>
                      {selectedAdmin?.id === admin.id && (
                        <Check className="w-5 h-5 text-navy" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  Code PIN à 4 chiffres
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(index => (
                    <input
                      key={index}
                      id={`pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={pin[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      disabled={pinStatus === 'verifying' || pinStatus === 'verified'}
                      className={`w-12 h-14 text-center text-xl font-semibold rounded-xl transition-all focus:outline-none ${
                        pinStatus === 'error'
                          ? 'border-2 border-red-400 bg-red-50 ring-2 ring-red-400'
                          : pinStatus === 'verified'
                          ? 'border-2 border-green-400 bg-green-50 ring-2 ring-green-400'
                          : pin[index]
                          ? 'border-2 border-[#1B3A6B]/40 bg-white ring-2 ring-[#1B3A6B]/40'
                          : 'bg-gray-50 focus:ring-2 focus:ring-[#1B3A6B]/40 focus:bg-white'
                      }`}
                      style={{
                        boxShadow: pinStatus === 'error' || pinStatus === 'verified' ? undefined : 'inset 0 1px 2px rgba(0,0,0,0.06)'
                      }}
                    />
                  ))}
                </div>
                {pinStatus === 'verifying' && (
                  <p className="text-xs text-navy text-center mt-2">Vérification...</p>
                )}
                {pinStatus === 'error' && (
                  <p className="text-xs text-status-red text-center mt-2">Code incorrect</p>
                )}
                {pinStatus === 'verified' && (
                  <p className="text-xs text-status-green text-center mt-2">✓ Code correct</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-black/6 px-6 py-4 flex items-center justify-between">
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="px-4 py-2.5 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="px-6 py-2.5 rounded-xl font-medium text-sm bg-navy text-white shadow-ambient hover:shadow-modal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? 'Suivant →' : 'Confirmer le congé'}
          </button>
        </div>
      </div>
    </div>
  )
}

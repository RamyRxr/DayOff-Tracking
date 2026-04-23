import { X, Mail, Phone, Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useDaysOff } from '../hooks/useDaysOff'
import { useBlocks } from '../hooks/useBlocks'
import AddDayOffModal from './AddDayOffModal'
import BlockEmployeeModal from './BlockEmployeeModal'
import UnblockModal from './UnblockModal'

export default function EmployeeDetailPanel({ employee, isOpen, onClose, onUpdate }) {
  const [showAddDayOff, setShowAddDayOff] = useState(false)
  const [showBlock, setShowBlock] = useState(false)
  const [showUnblock, setShowUnblock] = useState(false)

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

  const progressPercent = (employee.daysUsed / employee.daysTotal) * 100
  const daysRemaining = employee.daysTotal - employee.daysUsed

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
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Period: 20th of current month to 19th of next month
  const periodStart = new Date(currentYear, currentMonth, 20)
  const periodEnd = new Date(currentYear, currentMonth + 1, 19)

  // Create set of day-off dates for quick lookup
  const dayOffDates = new Set()
  daysOff.forEach((dayOff) => {
    const start = new Date(dayOff.startDate)
    const end = new Date(dayOff.endDate)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dayOffDates.add(d.toISOString().split('T')[0])
    }
  })

  // Generate all days in period
  const periodDays = []
  const current = new Date(periodStart)
  while (current <= periodEnd) {
    const dateString = current.toISOString().split('T')[0]
    periodDays.push({
      date: new Date(current),
      day: current.getDate(),
      isWeekend: current.getDay() === 5 || current.getDay() === 6, // Friday or Saturday
      isDayOff: dayOffDates.has(dateString), // Real day-off data
    })
    current.setDate(current.getDate() + 1)
  }

  const statusConfig = {
    actif: { label: 'Actif', color: 'text-status-green', bg: 'bg-status-green/10' },
    risque: { label: 'À risque', color: 'text-status-amber', bg: 'bg-status-amber/10' },
    bloqué: { label: 'Bloqué', color: 'text-status-red', bg: 'bg-status-red/10' },
  }

  const status = statusConfig[employee.status] || statusConfig.actif

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity animate-fade-in flex items-center justify-center p-6"
        onClick={onClose}
      >
        {/* Centered Modal */}
        <div
          className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-modal w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-black/6 px-8 py-5 flex items-center justify-between rounded-t-3xl z-10">
              <h2 className="font-display text-2xl font-bold text-[#111827]">
                Détails de l'employé
              </h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-black/5 active:scale-95 flex items-center justify-center transition-all duration-200"
              >
                <X className="w-6 h-6 text-[#6B7280]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
          {/* Employee info card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-ambient">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-warm-gray-200 flex items-center justify-center text-xl font-semibold text-[#374151] flex-shrink-0">
                {employee.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-[#111827]">
                  {employee.name}
                </h3>
                <p className="text-sm font-mono text-[#6B7280] mt-1">
                  {employee.matricule}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-warm-gray-300 text-[#374151] text-xs rounded-lg">
                    {employee.department}
                  </span>
                  <span className="px-3 py-1 bg-warm-gray-300 text-[#374151] text-xs rounded-lg">
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
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 rounded-lg">
                    <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">{getEmail()}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 rounded-lg">
                    <Phone className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">{employee.phone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-warm-gray-200 rounded-lg">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#6B7280]" />
                    <span className="text-xs text-[#6B7280]">{getStartDate()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
              <div className="text-2xl font-bold text-[#111827]">
                {employee.daysUsed}
              </div>
              <div className="text-xs text-[#6B7280] mt-1">Jours pris</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
              <div className="text-2xl font-bold text-status-green">
                {daysRemaining}
              </div>
              <div className="text-xs text-[#6B7280] mt-1">Jours restants</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
              <div className="text-2xl font-bold text-[#111827]">
                {employee.daysTotal}
              </div>
              <div className="text-xs text-[#6B7280] mt-1">Total annuel</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-medium text-[#111827]">
                Utilisation des congés
              </span>
              <span className="text-xs text-[#6B7280]">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full h-2 bg-warm-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-navy transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Split Calendar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
            <h4 className="text-sm font-semibold text-[#111827] mb-3">
              Période actuelle
            </h4>
            <div className="text-xs text-[#6B7280] mb-4">
              20 {periodStart.toLocaleDateString('fr-DZ', { month: 'long' })} —{' '}
              19 {periodEnd.toLocaleDateString('fr-DZ', { month: 'long' })}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-medium text-[#6B7280] pb-1"
                >
                  {day}
                </div>
              ))}

              {/* Days */}
              {periodDays.map((day, i) => (
                <div
                  key={i}
                  className={`aspect-square flex items-center justify-center text-[11px] rounded-md transition-all ${
                    day.isDayOff
                      ? 'bg-navy text-white font-semibold'
                      : day.isWeekend
                      ? 'bg-warm-gray-300 text-[#6B7280]'
                      : 'bg-warm-gray-200 text-[#374151] hover:bg-warm-gray-300'
                  }`}
                >
                  {day.day}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-black/6">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-navy" />
                <span className="text-[10px] text-[#6B7280]">Congé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-warm-gray-300" />
                <span className="text-[10px] text-[#6B7280]">Weekend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-warm-gray-200" />
                <span className="text-[10px] text-[#6B7280]">Travail</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddDayOff(true)}
              className="flex-1 bg-navy text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200"
            >
              + Ajouter un congé
            </button>
            {employee.status !== 'bloqué' && (
              <button
                onClick={() => setShowBlock(true)}
                className="px-4 py-3 border border-status-red/20 text-status-red rounded-xl font-medium text-sm hover:bg-status-red/5 transition-all duration-200"
              >
                Bloquer
              </button>
            )}
            {employee.status === 'bloqué' && (
              <button
                onClick={() => setShowUnblock(true)}
                className="px-4 py-3 border border-status-green/20 text-status-green rounded-xl font-medium text-sm hover:bg-status-green/5 transition-all duration-200"
              >
                Débloquer
              </button>
            )}
          </div>
            </div>
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
    </>
  )
}

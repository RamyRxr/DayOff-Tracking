import { X } from 'lucide-react'
import { useDaysOff } from '../hooks/useDaysOff'

export default function EmployeeDetailPanel({ employee, isOpen, onClose }) {
  // Fetch day-off records for this employee
  const { daysOff } = useDaysOff({ employeeId: employee?.id })

  if (!isOpen || !employee) return null

  const progressPercent = (employee.daysUsed / employee.daysTotal) * 100
  const daysRemaining = employee.daysTotal - employee.daysUsed

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
    actif: { label: 'Actif', color: 'text-apple-green', bg: 'bg-apple-green/10' },
    risque: { label: 'À risque', color: 'text-apple-amber', bg: 'bg-apple-amber/10' },
    bloqué: { label: 'Bloqué', color: 'text-apple-red', bg: 'bg-apple-red/10' },
  }

  const status = statusConfig[employee.status] || statusConfig.actif

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[480px] bg-white/90 backdrop-blur-2xl shadow-modal z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-black/6 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Détails de l'employé
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee info card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-ambient">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-warm-gray-400 flex items-center justify-center text-xl font-semibold text-gray-700 flex-shrink-0">
                {employee.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900">
                  {employee.name}
                </h3>
                <p className="text-sm font-mono text-gray-500 mt-1">
                  {employee.matricule}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-warm-gray-300 text-gray-700 text-xs rounded-lg">
                    {employee.department}
                  </span>
                  <span className="px-3 py-1 bg-warm-gray-300 text-gray-700 text-xs rounded-lg">
                    {employee.position}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg} mt-3`}>
                  <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`} />
                  <span className={`text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
              <div className="text-2xl font-bold text-gray-900">
                {employee.daysUsed}
              </div>
              <div className="text-xs text-gray-600 mt-1">Jours pris</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
              <div className="text-2xl font-bold text-apple-green">
                {daysRemaining}
              </div>
              <div className="text-xs text-gray-600 mt-1">Jours restants</div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
              <div className="text-2xl font-bold text-gray-900">
                {employee.daysTotal}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total annuel</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                Utilisation des congés
              </span>
              <span className="text-xs text-gray-600">
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
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Période actuelle
            </h4>
            <div className="text-xs text-gray-600 mb-4">
              20 {periodStart.toLocaleDateString('fr-DZ', { month: 'long' })} —{' '}
              19 {periodEnd.toLocaleDateString('fr-DZ', { month: 'long' })}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-medium text-gray-500 pb-1"
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
                      ? 'bg-warm-gray-300 text-gray-500'
                      : 'bg-warm-gray-200 text-gray-700 hover:bg-warm-gray-300'
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
                <span className="text-[10px] text-gray-600">Congé</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-warm-gray-300" />
                <span className="text-[10px] text-gray-600">Weekend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-warm-gray-200" />
                <span className="text-[10px] text-gray-600">Travail</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-navy text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200">
              + Ajouter un congé
            </button>
            {employee.status !== 'bloqué' && (
              <button className="px-4 py-3 border border-apple-red/20 text-apple-red rounded-xl font-medium text-sm hover:bg-apple-red/5 transition-all duration-200">
                Bloquer
              </button>
            )}
            {employee.status === 'bloqué' && (
              <button className="px-4 py-3 border border-apple-green/20 text-apple-green rounded-xl font-medium text-sm hover:bg-apple-green/5 transition-all duration-200">
                Débloquer
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

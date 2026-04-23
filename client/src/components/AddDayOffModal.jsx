import { useState } from 'react'
import { X, Calendar, AlertTriangle } from 'lucide-react'
import AdminPinEntry from './AdminPinEntry'

export default function AddDayOffModal({ employee, isOpen, onClose, onSubmit }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showPinEntry, setShowPinEntry] = useState(false)

  if (!isOpen) return null

  // Calculate working days between dates (excluding weekends: Fri/Sat)
  const calculateWorkingDays = (start, end) => {
    if (!start || !end) return 0

    const startD = new Date(start)
    const endD = new Date(end)
    let count = 0

    const current = new Date(startD)
    while (current <= endD) {
      const day = current.getDay()
      // Friday = 5, Saturday = 6 (Algeria weekend)
      if (day !== 5 && day !== 6) {
        count++
      }
      current.setDate(current.getDate() + 1)
    }

    return count
  }

  const workingDays = calculateWorkingDays(startDate, endDate)
  const newTotalDaysUsed = (employee?.daysUsed || 0) + workingDays
  const daysRemaining = (employee?.daysTotal || 30) - newTotalDaysUsed
  const wouldBlock = daysRemaining < 14 // Block if < 16 working days remaining (30 - 16 = 14)

  const handleSubmit = () => {
    if (!startDate || !endDate || !employee) return
    setShowPinEntry(true)
  }

  const handlePinSuccess = () => {
    onSubmit?.({
      employeeId: employee.id,
      startDate,
      endDate,
      workingDays,
    })
    handleClose()
  }

  const handleClose = () => {
    setStartDate('')
    setEndDate('')
    setShowPinEntry(false)
    onClose?.()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center animate-fade-in"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-modal w-[480px] max-h-[90vh] overflow-y-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-black/6 px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <h2 className="font-display text-xl font-bold text-[#111827]">
              Ajouter un congé
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Employee info */}
            {employee && (
              <div className="bg-warm-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151]">
                    {employee.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[#111827]">
                      {employee.name}
                    </div>
                    <div className="text-xs font-mono text-[#6B7280]">
                      {employee.matricule}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#6B7280]">Jours disponibles</div>
                    <div className="text-lg font-bold text-navy">
                      {employee.daysTotal - employee.daysUsed}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Date range */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Date de début
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Date de fin
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {startDate && endDate && workingDays > 0 && (
              <div className="bg-warm-gray-200 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-[#111827]">
                  Aperçu de l'impact
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-[#6B7280]">Jours ouvrables</div>
                    <div className="text-2xl font-bold text-navy">
                      {workingDays}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs text-[#6B7280]">Total après</div>
                    <div className="text-2xl font-bold text-[#111827]">
                      {newTotalDaysUsed} / {employee?.daysTotal || 30}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3">
                  <div className="text-xs text-[#6B7280] mb-2">
                    Jours restants après ce congé
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div
                      className={`text-2xl font-bold ${
                        wouldBlock ? 'text-status-red' : 'text-status-green'
                      }`}
                    >
                      {daysRemaining}
                    </div>
                    {wouldBlock && (
                      <span className="text-xs text-status-red">
                        jours (risque de blocage)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warning if would block */}
            {wouldBlock && startDate && endDate && (
              <div className="flex gap-3 p-4 bg-status-red/10 border border-status-red/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-status-red flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-status-red text-sm">
                    Attention : Risque de blocage
                  </div>
                  <p className="text-xs text-status-red/80 mt-1">
                    Ce congé laissera moins de 16 jours ouvrables dans la
                    période, ce qui pourrait bloquer l'employé.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-black/6 px-6 py-4 flex gap-3 rounded-b-3xl">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all duration-200"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!startDate || !endDate || workingDays === 0}
              className="flex-1 bg-navy text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>

      {/* PIN Entry */}
      <AdminPinEntry
        isOpen={showPinEntry}
        onClose={() => setShowPinEntry(false)}
        onSuccess={handlePinSuccess}
        actionLabel="Ajouter un congé"
      />
    </>
  )
}

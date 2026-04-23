import { useState } from 'react'
import { X, ShieldAlert, AlertTriangle } from 'lucide-react'
import AdminPinEntry from './AdminPinEntry'

export default function BlockEmployeeModal({ employee, isOpen, onClose, onSubmit }) {
  const [reason, setReason] = useState('')
  const [showPinEntry, setShowPinEntry] = useState(false)

  if (!isOpen || !employee) return null

  const daysRemaining = employee.daysTotal - employee.daysUsed
  const workingDaysLeft = daysRemaining

  const handleSubmit = () => {
    setShowPinEntry(true)
  }

  const handlePinSuccess = () => {
    onSubmit?.({
      employeeId: employee.id,
      reason: reason.trim() || 'Jours ouvrables insuffisants',
      daysUsed: employee.daysUsed,
      daysRemaining,
    })
    handleClose()
  }

  const handleClose = () => {
    setReason('')
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
          className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-modal w-[480px] animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-status-red/10 border-b border-status-red/20 px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-status-red/20 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-status-red" strokeWidth={2} />
              </div>
              <h2 className="font-display text-xl font-bold text-[#111827]">
                Bloquer l'employé
              </h2>
            </div>
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
            <div className="bg-warm-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151]">
                  {employee.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#111827] text-base">
                    {employee.name}
                  </div>
                  <div className="text-xs font-mono text-[#6B7280]">
                    {employee.matricule}
                  </div>
                  <div className="text-xs text-[#6B7280] mt-0.5">
                    {employee.department} · {employee.position}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning message */}
            <div className="flex gap-3 p-4 bg-status-amber/10 border border-status-amber/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-status-amber flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-status-amber text-sm">
                  Minimum de jours ouvrables non respecté
                </div>
                <p className="text-xs text-[#374151] mt-1">
                  L'employé a utilisé trop de jours de congé. Il ne reste que{' '}
                  <span className="font-semibold">{workingDaysLeft} jours</span>{' '}
                  sur les 30 jours annuels. Le minimum requis est de 16 jours
                  ouvrables par période.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-warm-gray-200 rounded-xl p-3 text-center">
                <div className="text-xs text-[#6B7280] mb-1">Jours pris</div>
                <div className="text-2xl font-bold text-[#111827]">
                  {employee.daysUsed}
                </div>
              </div>
              <div className="bg-status-red/10 rounded-xl p-3 text-center border border-status-red/20">
                <div className="text-xs text-status-red mb-1">Restants</div>
                <div className="text-2xl font-bold text-status-red">
                  {daysRemaining}
                </div>
              </div>
              <div className="bg-warm-gray-200 rounded-xl p-3 text-center">
                <div className="text-xs text-[#6B7280] mb-1">Minimum</div>
                <div className="text-2xl font-bold text-navy">16</div>
              </div>
            </div>

            {/* Reason field */}
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Raison du blocage
                <span className="text-[#6B7280] font-normal ml-1">(optionnel)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jours ouvrables insuffisants"
                rows={3}
                className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
              />
              <div className="text-xs text-[#6B7280] mt-1">
                Cette raison sera visible dans l'historique de l'employé.
              </div>
            </div>

            {/* Impact notice */}
            <div className="bg-warm-gray-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-[#111827] mb-2">
                Conséquences du blocage
              </h4>
              <ul className="space-y-1.5 text-xs text-[#374151]">
                <li className="flex gap-2">
                  <span className="text-status-red">•</span>
                  <span>L'employé ne pourra plus demander de congés</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-status-red">•</span>
                  <span>Son statut sera marqué comme "Bloqué"</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-status-red">•</span>
                  <span>Un admin RH pourra le débloquer manuellement</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white/90 backdrop-blur-xl border-t border-black/6 px-6 py-4 flex gap-3 rounded-b-3xl">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all duration-200"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-status-red text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200"
            >
              Bloquer l'employé
            </button>
          </div>
        </div>
      </div>

      {/* PIN Entry */}
      <AdminPinEntry
        isOpen={showPinEntry}
        onClose={() => setShowPinEntry(false)}
        onSuccess={handlePinSuccess}
        actionLabel="Bloquer l'employé"
      />
    </>
  )
}

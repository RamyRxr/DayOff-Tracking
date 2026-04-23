import { useState } from 'react'
import { X, Unlock, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import AdminPinEntry from './AdminPinEntry'

export default function UnblockModal({ employee, activeBlock, isOpen, onClose, onSubmit }) {
  const [unblockReason, setUnblockReason] = useState('')
  const [description, setDescription] = useState('')
  const [showPinEntry, setShowPinEntry] = useState(false)

  if (!isOpen || !employee) return null

  const handleSubmit = () => {
    if (!unblockReason) return
    setShowPinEntry(true)
  }

  const handlePinSuccess = () => {
    onSubmit?.({
      blockId: activeBlock?.id,
      employeeId: employee.id,
      reason: unblockReason,
      description: description.trim(),
    })
    handleClose()
  }

  const handleClose = () => {
    setUnblockReason('')
    setDescription('')
    setShowPinEntry(false)
    onClose?.()
  }

  const getBlockDate = () => {
    if (!activeBlock?.createdAt) return '—'
    try {
      return format(new Date(activeBlock.createdAt), 'dd MMM yyyy', { locale: fr })
    } catch {
      return '—'
    }
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
          className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-modal w-[480px] animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-status-green/10 border-b border-status-green/20 px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-status-green/20 flex items-center justify-center">
                  <Unlock className="w-5 h-5 text-status-green" strokeWidth={2} />
                </div>
                <h2 className="font-display text-xl font-bold text-[#111827]">
                  Débloquer l'Employé
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] ml-13">
                L'employé pourra reprendre normalement ses activités
              </p>
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
                </div>
              </div>
            </div>

            {/* Block summary card */}
            <div className="bg-warm-gray-200 rounded-xl p-4 shadow-inner">
              <h4 className="text-sm font-semibold text-[#111827] mb-3">
                Informations du blocage
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Motif du blocage</span>
                  <span className="text-[#111827] font-medium">
                    {activeBlock?.reason || 'Non spécifié'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Date de blocage</span>
                  <span className="text-[#111827] font-medium">
                    {getBlockDate()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Bloqué par</span>
                  <span className="text-[#111827] font-medium">
                    {activeBlock?.adminName || 'Admin RH'}
                  </span>
                </div>
              </div>
            </div>

            {/* Unblock reason dropdown */}
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Motif du déblocage
                <span className="text-status-red ml-1">*</span>
              </label>
              <select
                value={unblockReason}
                onChange={(e) => setUnblockReason(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-status-green/20 focus:border-status-green transition-all"
              >
                <option value="">Sélectionnez un motif</option>
                <option value="Erreur administrative">Erreur administrative</option>
                <option value="Justification acceptée">Justification acceptée</option>
                <option value="Décision hiérarchique">Décision hiérarchique</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            {/* Description field */}
            <div>
              <label className="block text-sm font-medium text-[#111827] mb-2">
                Description
                <span className="text-[#6B7280] font-normal ml-1">(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Remarques sur le déblocage..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-status-green/20 focus:border-status-green transition-all"
              />
            </div>

            {/* Success notice */}
            <div className="flex gap-3 p-4 bg-status-green/10 border border-status-green/20 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-status-green flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-status-green text-sm">
                  Déblocage immédiat
                </div>
                <p className="text-xs text-[#374151] mt-1">
                  Après confirmation, l'employé pourra immédiatement demander de
                  nouveaux congés et son statut sera mis à jour.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white/90 backdrop-blur-xl border-t border-black/6 px-6 py-4">
            <div className="flex gap-3 mb-2">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!unblockReason}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: unblockReason ? '#2D8653' : '#9CA3AF', color: 'white' }}
              >
                Confirmer le déblocage
              </button>
            </div>
            <p className="text-[10px] text-[#6B7280] text-center">
              Le statut de l'employé sera mis à jour immédiatement
            </p>
          </div>
        </div>
      </div>

      {/* PIN Entry */}
      <AdminPinEntry
        isOpen={showPinEntry}
        onClose={() => setShowPinEntry(false)}
        onSuccess={handlePinSuccess}
        actionLabel="Débloquer l'employé"
      />
    </>
  )
}

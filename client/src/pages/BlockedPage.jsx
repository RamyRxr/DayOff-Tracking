import { useState } from 'react'
import { ShieldAlert, AlertCircle, Unlock } from 'lucide-react'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AdminPinEntry from '../components/AdminPinEntry'

// Mock blocked employees data
const mockBlockedEmployees = [
  {
    id: 4,
    name: 'Leila Hamidi',
    matricule: 'NAF-3215',
    department: 'Finance',
    position: 'Contrôleur',
    daysUsed: 22,
    daysTotal: 30,
    status: 'bloqué',
    avatar: 'LH',
    blockedAt: '2026-04-15',
    blockedReason: 'Jours ouvrables insuffisants - 8 jours restants sur 30',
    blockedBy: 'Mohammed S.',
  },
  {
    id: 8,
    name: 'Nabil Khelifi',
    matricule: 'NAF-2978',
    department: 'Production',
    position: 'Opérateur',
    daysUsed: 24,
    daysTotal: 30,
    status: 'bloqué',
    avatar: 'NK',
    blockedAt: '2026-04-18',
    blockedReason: 'Dépassement du quota - 6 jours restants',
    blockedBy: 'Mohammed S.',
  },
]

export default function BlockedPage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [unblockEmployee, setUnblockEmployee] = useState(null)
  const [showPinEntry, setShowPinEntry] = useState(false)

  const handleUnblockClick = (employee, e) => {
    e.stopPropagation()
    setUnblockEmployee(employee)
  }

  const handleConfirmUnblock = () => {
    setShowPinEntry(true)
  }

  const handlePinSuccess = () => {
    // Handle unblock action
    console.log('Unblock employee:', unblockEmployee)
    setUnblockEmployee(null)
    setShowPinEntry(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-DZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-apple-red/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-apple-red" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Employés Bloqués
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          Liste des employés bloqués pour dépassement de quota
        </p>
      </div>

      {/* Alert banner */}
      {mockBlockedEmployees.length > 0 && (
        <div className="flex gap-3 p-4 bg-apple-red/10 border border-apple-red/20 rounded-2xl mb-6">
          <AlertCircle className="w-5 h-5 text-apple-red flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-apple-red text-sm">
              {mockBlockedEmployees.length} employé
              {mockBlockedEmployees.length > 1 ? 's bloqués' : ' bloqué'}
            </div>
            <p className="text-xs text-gray-700 mt-1">
              Ces employés ne peuvent plus demander de congés. Vous pouvez les
              débloquer manuellement après vérification.
            </p>
          </div>
        </div>
      )}

      {/* Blocked employees list */}
      <div className="space-y-3">
        {mockBlockedEmployees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-ambient hover:shadow-modal transition-all duration-200 overflow-hidden"
          >
            <div className="p-5">
              {/* Top section */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-warm-gray-400 flex items-center justify-center text-sm font-semibold text-gray-700 flex-shrink-0">
                  {employee.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {employee.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-gray-600">
                          {employee.matricule}
                        </span>
                        <span className="px-2 py-0.5 bg-warm-gray-300 text-gray-700 text-[11px] rounded-md">
                          {employee.department}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {employee.position}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-apple-red/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-apple-red" />
                      <span className="text-xs font-medium text-apple-red">
                        Bloqué
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason section */}
              <div className="bg-warm-gray-200 rounded-xl p-3 mb-4">
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  Raison du blocage
                </div>
                <div className="text-sm text-gray-900">
                  {employee.blockedReason}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Bloqué le {formatDate(employee.blockedAt)} par{' '}
                  {employee.blockedBy}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-warm-gray-200 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Jours pris</div>
                  <div className="text-xl font-bold text-gray-900">
                    {employee.daysUsed}
                  </div>
                </div>
                <div className="bg-apple-red/10 rounded-lg p-3 text-center border border-apple-red/20">
                  <div className="text-xs text-apple-red mb-1">Restants</div>
                  <div className="text-xl font-bold text-apple-red">
                    {employee.daysTotal - employee.daysUsed}
                  </div>
                </div>
                <div className="bg-warm-gray-200 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Minimum</div>
                  <div className="text-xl font-bold text-navy">16</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEmployee(employee)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-black/5 transition-all duration-200"
                >
                  Voir détails
                </button>
                <button
                  onClick={(e) => handleUnblockClick(employee, e)}
                  className="flex-1 flex items-center justify-center gap-2 bg-apple-green text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200"
                >
                  <Unlock className="w-4 h-4" strokeWidth={2} />
                  Débloquer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {mockBlockedEmployees.length === 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-ambient p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-apple-green/10 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-apple-green" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun employé bloqué
          </h3>
          <p className="text-sm text-gray-600">
            Tous les employés respectent le quota minimum de jours ouvrables.
          </p>
        </div>
      )}

      {/* Unblock confirmation popover */}
      {unblockEmployee && !showPinEntry && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center"
          onClick={() => setUnblockEmployee(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-modal w-[400px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-apple-green/10 flex items-center justify-center">
                <Unlock className="w-7 h-7 text-apple-green" strokeWidth={2} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-center text-xl font-semibold text-gray-900 mb-2">
              Débloquer l'employé
            </h3>

            {/* Message */}
            <p className="text-center text-sm text-gray-600 mb-6">
              Voulez-vous débloquer <strong>{unblockEmployee.name}</strong> ?
              L'employé pourra à nouveau demander des congés.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setUnblockEmployee(null)}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-gray-600 hover:bg-black/5 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmUnblock}
                className="flex-1 bg-apple-green text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail Panel */}
      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* PIN Entry */}
      <AdminPinEntry
        isOpen={showPinEntry}
        onClose={() => {
          setShowPinEntry(false)
          setUnblockEmployee(null)
        }}
        onSuccess={handlePinSuccess}
        actionLabel="Débloquer l'employé"
      />
    </div>
  )
}

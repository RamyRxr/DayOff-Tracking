import { useState } from 'react'
import { ShieldAlert, AlertCircle, Unlock, Loader2, Download } from 'lucide-react'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import UnblockModal from '../components/UnblockModal'
import { useBlocks } from '../hooks/useBlocks'

export default function BlockedPage() {
  const { blocks, loading, error, unblock, refetch } = useBlocks(true)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [unblockEmployee, setUnblockEmployee] = useState(null)
  const [showUnblock, setShowUnblock] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-apple-red/10 border border-apple-red/20 rounded-2xl p-6">
        <div className="font-semibold text-apple-red mb-2">Erreur</div>
        <p className="text-sm text-gray-700">{error}</p>
      </div>
    )
  }

  // Transform blocks to match component format
  const mockBlockedEmployees = blocks.map((block) => ({
    id: block.employee.id,
    name: block.employee.name,
    matricule: block.employee.matricule,
    department: block.employee.department,
    position: block.employee.position,
    daysUsed: block.daysUsed,
    daysTotal: block.employee.daysTotal,
    status: 'bloqué',
    avatar: block.employee.avatar,
    blockedAt: block.blockedAt,
    blockedReason: block.reason,
    blockedBy: block.blockedBy.name,
    blockId: block.id,
    blockData: block,
  }))

  const handleUnblockClick = (employee, block, e) => {
    e.stopPropagation()
    setUnblockEmployee({ employee, block })
    setShowUnblock(true)
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
      setUnblockEmployee(null)
      refetch()
      alert('✅ Employé débloqué avec succès')
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-DZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleExport = () => {
    // Generate CSV content
    const headers = ['Nom', 'Matricule', 'Email', 'Téléphone', 'Département', 'Motif', 'Date de blocage']
    const rows = mockBlockedEmployees.map(emp => {
      const email = emp.email || `${emp.name.toLowerCase().split(' ').join('.')}@naftal.dz`
      const phone = emp.phone || '—'
      return [
        emp.name,
        emp.matricule,
        email,
        phone,
        emp.department,
        emp.blockedReason,
        formatDate(emp.blockedAt)
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const today = new Date().toISOString().split('T')[0]

    link.setAttribute('href', url)
    link.setAttribute('download', `employes-bloques-${today}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
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
        {mockBlockedEmployees.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-navy border border-navy/20 hover:bg-navy/5 transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter les données
          </button>
        )}
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

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEmployee(employee)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm text-gray-600 hover:bg-black/5 transition-all duration-200"
                >
                  Voir détails
                </button>
                <button
                  onClick={(e) => handleUnblockClick(employee, employee.blockData, e)}
                  className="flex-1 flex items-center justify-center gap-2 border border-status-green/30 text-status-green px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-status-green/5 transition-all duration-200"
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

      {/* Employee Detail Panel */}
      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onUpdate={refetch}
      />

      {/* Unblock Modal */}
      <UnblockModal
        employee={unblockEmployee?.employee}
        activeBlock={unblockEmployee?.block}
        isOpen={showUnblock}
        onClose={() => {
          setShowUnblock(false)
          setUnblockEmployee(null)
        }}
        onSubmit={handleUnblockSubmit}
      />
    </div>
  )
}

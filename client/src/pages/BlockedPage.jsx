import { useState } from 'react'
import { ShieldAlert, AlertCircle, Unlock, Loader2, Download } from 'lucide-react'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import UnblockModal from '../components/UnblockModal'
import { useBlocks } from '../hooks/useBlocks'
import { useTheme } from '../contexts/ThemeContext'

export default function BlockedPage() {
  const { isDark } = useTheme()
  const { blocks, loading, error, unblock, refetch } = useBlocks(true)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [unblockEmployee, setUnblockEmployee] = useState(null)
  const [showUnblock, setShowUnblock] = useState(false)

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-navy dark:text-[#639DFF] animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className="bg-apple-red/10 border border-apple-red/20 rounded-2xl p-6"
        style={isDark ? {
          backgroundColor: 'rgba(192,57,43,0.15)',
          borderColor: 'rgba(255,59,48,0.2)'
        } : {}}
      >
        <div className="font-semibold text-apple-red dark:text-[#FF6B6B] mb-2">{t('erreur')}</div>
        <p className="text-sm text-gray-700 dark:text-[#7A9CC4]">{error}</p>
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

  const handleDownloadBlockDetails = (employee, block, e) => {
    e.stopPropagation()

    // Calculate period dates
    const currentDate = new Date()
    const periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 20)
    const periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 19)

    const periodStartFormatted = periodStart.toLocaleDateString('fr-DZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const periodEndFormatted = periodEnd.toLocaleDateString('fr-DZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    // Get employee data from the block
    const emp = block.employee
    const email = emp.email || `${emp.name.toLowerCase().split(' ').join('.')}@naftal.dz`

    // File content
    const content = `════════════════════════════════════════
${t('decisionBlocageTitre')}
════════════════════════════════════════
${t('matricule')}:        ${emp.matricule}
${t('nomComplet')}:      ${emp.name}
${t('departement')}:      ${emp.department}
${t('poste')}:            ${emp.position}
${t('email')}:            ${email}
${t('telephone')}:        ${emp.phone || '—'}
────────────────────────────────────────
${t('dateBlocage')}:  ${formatDate(block.blockedAt)}
${t('motif')}:            ${block.reason}
${t('description')}:      ${block.description || '—'}
${t('bloquePar')}:       ${block.blockedBy?.name || '—'} — ${block.blockedBy?.role || '—'}
────────────────────────────────────────
${t('periodeLabel')}:          ${periodStartFormatted} → ${periodEndFormatted}
${t('joursConge')}:   ${block.daysUsed} / 15
════════════════════════════════════════`

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const today = new Date().toISOString().split('T')[0]
    a.href = url
    a.download = `decision-blocage-${emp.matricule}-${today}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = () => {
    // Generate CSV content
    const headers = [t('nom'), t('matricule'), t('email'), t('telephone'), t('departement'), t('motifBlocage'), t('dateBlocage')]
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
            <div className="w-10 h-10 rounded-full bg-apple-red/10 dark:bg-[rgba(192,57,43,0.2)] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-apple-red dark:text-[#FF6B6B]" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-[#E8EFF8]">
              {t('employesBloque')}
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-[#7A9CC4]">
            Liste des employés bloqués pour dépassement de quota
          </p>
        </div>
        {mockBlockedEmployees.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-navy dark:text-[#639DFF] border border-navy/20 dark:border-white/[0.12] hover:bg-navy/5 dark:hover:bg-white/[0.04] transition-all"
            style={isDark ? {
              borderColor: 'rgba(99,157,255,0.2)'
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
            <Download className="w-4 h-4" />
            Exporter les données
          </button>
        )}
      </div>

      {/* Alert banner */}
      {mockBlockedEmployees.length > 0 && (
        <div className="flex gap-3 p-4 bg-apple-red/10 dark:bg-[rgba(192,57,43,0.2)] border border-apple-red/20 dark:border-[rgba(255,59,48,0.2)] rounded-2xl mb-6">
          <AlertCircle className="w-5 h-5 text-apple-red dark:text-[#FF6B6B] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-apple-red dark:text-[#FF6B6B] text-sm">
              {mockBlockedEmployees.length} employé
              {mockBlockedEmployees.length > 1 ? 's bloqués' : ' bloqué'}
            </div>
            <p className="text-xs text-gray-700 dark:text-[#7A9CC4] mt-1">
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
            className="bg-white/80 backdrop-blur-xl rounded-2xl transition-all duration-200 overflow-hidden border border-black/6 dark:border-white/[0.07]"
            style={isDark ? {
              backgroundColor: '#0B1120',
              border: '1px solid rgba(99,157,255,0.12)',
              boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 8px 24px rgba(0,0,0,0.5)'
            } : {
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="p-5">
              {/* Top section */}
              <div className="flex items-start gap-4 mb-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full bg-warm-gray-400 dark:bg-white/[0.06] flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-[#8E8E93] flex-shrink-0"
                  style={isDark ? {
                    backgroundColor: 'rgba(99,157,255,0.1)',
                    color: '#7A9CC4'
                  } : {}}
                >
                  {employee.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-[#E8EFF8] truncate">
                        {employee.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono text-gray-600 dark:text-[#7A9CC4]">
                          {employee.matricule}
                        </span>
                        <span
                          className="px-2 py-0.5 bg-warm-gray-300 dark:bg-white/[0.06] text-gray-700 dark:text-[#8E8E93] text-[11px] rounded-md"
                          style={isDark ? {
                            backgroundColor: 'rgba(99,157,255,0.08)',
                            color: '#7A9CC4'
                          } : {}}
                        >
                          {employee.department}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-[#7A9CC4] mt-1">
                        {employee.position}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-apple-red/10 dark:bg-[rgba(192,57,43,0.2)] border border-transparent dark:border-[rgba(255,59,48,0.2)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-apple-red dark:bg-[#FF6B6B]" />
                      <span className="text-xs font-medium text-apple-red dark:text-[#FF6B6B]">
                        {t('bloque')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason section */}
              <div
                className="bg-warm-gray-200 dark:bg-white/[0.04] rounded-xl p-3 mb-4"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.06)',
                  border: '1px solid rgba(99,157,255,0.08)'
                } : {}}
              >
                <div className="text-xs font-semibold text-gray-700 dark:text-[#7A9CC4] mb-1">
                  {t('raisonDuBlocage')}
                </div>
                <div className="text-sm text-gray-900 dark:text-[#E8EFF8]">
                  {employee.blockedReason}
                </div>
                <div className="text-xs text-gray-600 dark:text-[#7A9CC4] mt-2">
                  {t('bloqueLe')} {formatDate(employee.blockedAt)} {t('par')}{' '}
                  {employee.blockedBy}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedEmployee(employee)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium text-sm text-gray-600 dark:text-[#7A9CC4] hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all duration-200"
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
                  {t('voirDetails')}
                </button>
                <button
                  onClick={(e) => handleDownloadBlockDetails(employee, employee.blockData, e)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-medium text-sm text-navy dark:text-[#639DFF] border border-navy/20 dark:border-white/[0.12] hover:bg-navy/5 dark:hover:bg-white/[0.04] transition-all duration-200"
                  style={isDark ? {
                    borderColor: 'rgba(99,157,255,0.2)',
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
                  <Download className="w-3.5 h-3.5" />
                  {t('telecharger')}
                </button>
                <button
                  onClick={(e) => handleUnblockClick(employee, employee.blockData, e)}
                  className="flex items-center justify-center gap-2 border border-status-green/30 dark:border-[rgba(52,199,89,0.2)] text-status-green dark:text-[#34C759] px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-status-green/5 dark:hover:bg-[rgba(52,199,89,0.1)] transition-all duration-200"
                  style={isDark ? {
                    backgroundColor: 'transparent'
                  } : {}}
                  onMouseEnter={(e) => {
                    if (isDark) {
                      e.currentTarget.style.backgroundColor = 'rgba(52,199,89,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isDark) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <Unlock className="w-4 h-4" strokeWidth={2} />
                  {t('debloquer')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {mockBlockedEmployees.length === 0 && (
        <div
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-16 text-center border border-black/6 dark:border-white/[0.07]"
          style={isDark ? {
            backgroundColor: '#0B1120',
            border: '1px solid rgba(99,157,255,0.12)',
            boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 8px 24px rgba(0,0,0,0.5)'
          } : {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="w-16 h-16 rounded-full bg-apple-green/10 dark:bg-[rgba(52,199,89,0.15)] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-apple-green dark:text-[#34C759]" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8EFF8] mb-2">
            Aucun employé bloqué
          </h3>
          <p className="text-sm text-gray-600 dark:text-[#7A9CC4]">
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

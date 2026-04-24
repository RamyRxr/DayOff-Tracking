import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import EmployeeCard from '../components/EmployeeCard'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AddEmployeeModal from '../components/AddEmployeeModal'
import AddDayOffModal from '../components/AddDayOffModal'
import { useEmployees } from '../hooks/useEmployees'
import { useDaysOff } from '../hooks/useDaysOff'

export default function HomePage() {
  const { t } = useTranslation()
  const location = useLocation()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [dayOffEmployee, setDayOffEmployee] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  const { employees, loading, error, refetch, addEmployee } = useEmployees()
  const { addDayOff } = useDaysOff({ employeeId: dayOffEmployee?.id })

  const isHomePage = location.pathname === '/'
  const isAnyModalOpen = !!selectedEmployee || showAddEmployee || !!dayOffEmployee

  // Calculate stats from employees data
  const stats = {
    total: employees.length,
    actif: employees.filter((e) => e.status === 'actif').length,
    risque: employees.filter((e) => e.status === 'risque').length,
    bloqué: employees.filter((e) => e.status === 'bloqué').length,
  }

  // Filter employees based on active filter
  const filteredEmployees = activeFilter
    ? employees.filter((e) => e.status === activeFilter)
    : employees

  // Get filter label for display
  const getFilterLabel = () => {
    if (!activeFilter) return null
    const count = filteredEmployees.length
    const labels = {
      actif: t('actifs'),
      risque: t('aRisque'),
      bloqué: t('bloques_'),
    }
    return `${t('affichage')} : ${count} ${count > 1 ? t('employesPlural') : t('employe')} ${labels[activeFilter]}`
  }

  const handleAddEmployeeSubmit = async (employeeData) => {
    try {
      await addEmployee(employeeData)
      setShowAddEmployee(false)
      alert('✅ Employé ajouté avec succès')
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

  const handleAddDayOffSubmit = async (dayOffData) => {
    try {
      const result = await addDayOff(dayOffData)
      setDayOffEmployee(null)
      refetch()

      // Show alert if employee was auto-blocked
      if (result.block) {
        alert(`⚠️ Employé bloqué automatiquement: ${result.block.reason}`)
      } else {
        alert('✅ Congé ajouté avec succès')
      }
    } catch (error) {
      alert(`Erreur: ${error.message}`)
    }
  }

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
      <div className="bg-status-red/10 border border-status-red/20 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-status-red" />
          <div>
            <div className="font-semibold text-status-red">
              {t('erreurChargement')}
            </div>
            <p className="text-sm text-[#374151] mt-1">{error}</p>
            <button
              onClick={refetch}
              className="text-sm text-navy hover:underline mt-2"
            >
              {t('reessayer')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Animated tab pills - Interactive filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-ambient mb-6 animate-fade-up">
        <div className="relative flex items-center justify-between gap-2">
          {/* Employés pill */}
          <button
            onClick={() => setActiveFilter(null)}
            className={`relative z-10 flex-1 rounded-xl px-5 py-3 text-center border transition-all duration-200 backdrop-blur-[8px] ${
              activeFilter === null
                ? 'bg-white text-gray-900 font-semibold border-black/[0.08] scale-[1.03]'
                : 'bg-white/60 text-gray-500 border-black/[0.06] hover:bg-white/85 hover:text-gray-700 hover:scale-[1.02]'
            }`}
            style={{
              boxShadow: activeFilter === null
                ? 'inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== null) {
                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== null) {
                e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)'
              }
            }}
          >
            <div className="text-[22px] font-bold">{stats.total}</div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">{t('totalEmployes')}</div>
          </button>

          {/* Actifs pill */}
          <button
            onClick={() => setActiveFilter('actif')}
            className={`relative z-10 flex-1 rounded-xl px-5 py-3 text-center border transition-all duration-200 backdrop-blur-[8px] ${
              activeFilter === 'actif'
                ? 'bg-white text-gray-900 font-semibold border-black/[0.08] scale-[1.03]'
                : 'bg-white/60 text-gray-500 border-black/[0.06] hover:bg-white/85 hover:text-gray-700 hover:scale-[1.02]'
            }`}
            style={{
              boxShadow: activeFilter === 'actif'
                ? 'inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== 'actif') {
                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== 'actif') {
                e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)'
              }
            }}
          >
            <div className="text-[22px] font-bold">{stats.actif}</div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">{t('actifs')}</div>
          </button>

          {/* À risque pill */}
          <button
            onClick={() => setActiveFilter('risque')}
            className={`relative z-10 flex-1 rounded-xl px-5 py-3 text-center border transition-all duration-200 backdrop-blur-[8px] ${
              activeFilter === 'risque'
                ? 'bg-white text-gray-900 font-semibold border-black/[0.08] scale-[1.03]'
                : 'bg-white/60 text-gray-500 border-black/[0.06] hover:bg-white/85 hover:text-gray-700 hover:scale-[1.02]'
            }`}
            style={{
              boxShadow: activeFilter === 'risque'
                ? 'inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== 'risque') {
                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== 'risque') {
                e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)'
              }
            }}
          >
            <div className={`text-[22px] font-bold ${activeFilter === 'risque' ? 'text-amber-600' : ''}`}>
              {stats.risque}
            </div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">{t('aRisque')}</div>
          </button>

          {/* Bloqués pill */}
          <button
            onClick={() => setActiveFilter('bloqué')}
            className={`relative z-10 flex-1 rounded-xl px-5 py-3 text-center border transition-all duration-200 backdrop-blur-[8px] ${
              activeFilter === 'bloqué'
                ? 'bg-white text-gray-900 font-semibold border-black/[0.08] scale-[1.03]'
                : 'bg-white/60 text-gray-500 border-black/[0.06] hover:bg-white/85 hover:text-gray-700 hover:scale-[1.02]'
            }`}
            style={{
              boxShadow: activeFilter === 'bloqué'
                ? 'inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== 'bloqué') {
                e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== 'bloqué') {
                e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)'
              }
            }}
          >
            <div className={`text-[22px] font-bold ${activeFilter === 'bloqué' ? 'text-red-600' : ''}`}>
              {stats.bloqué}
            </div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">{t('bloques')}</div>
          </button>
        </div>
      </div>

      {/* Filter label */}
      {getFilterLabel() && (
        <div className="text-sm text-[#6B7280] font-medium mb-4">
          {getFilterLabel()}
        </div>
      )}

      {/* Section label */}
      <h2 className="text-xs uppercase tracking-widest text-[#6B7280] font-semibold mb-4 mt-8">
        {t('activiteRecente')}
      </h2>

      {/* Employee table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-ambient overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#6B7280]">{t('aucunEmployeTrouve')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-warm-gray-200 border-b border-black/6">
              <tr>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#374151] uppercase tracking-wider">
                  {t('employe')}
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#374151] uppercase tracking-wider">
                  {t('departement')}
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#374151] uppercase tracking-wider">
                  {t('conge')}
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#374151] uppercase tracking-wider">
                  {t('statut')}
                </th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-[#374151] uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/6">
              {filteredEmployees.slice(0, 5).map((employee) => {
                const statusConfig = {
                  actif: { label: t('actif'), dotColor: 'bg-status-green', bgColor: 'bg-status-green/10', textColor: 'text-status-green' },
                  risque: { label: t('aRisqueStatus'), dotColor: 'bg-status-amber', bgColor: 'bg-status-amber/10', textColor: 'text-status-amber' },
                  bloqué: { label: t('bloque'), dotColor: 'bg-status-red', bgColor: 'bg-status-red/10', textColor: 'text-status-red' },
                }
                const status = statusConfig[employee.status] || statusConfig.actif

                return (
                  <tr
                    key={employee.id}
                    className="h-[52px] hover:bg-black/[0.02] transition-colors cursor-pointer"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warm-gray-200 flex items-center justify-center text-xs font-semibold text-[#374151]">
                          {employee.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#111827]">
                            {employee.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#6B7280]">
                            {employee.matricule}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-0.5 bg-warm-gray-300 text-[#374151] text-[11px] rounded-md">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-[#111827]">
                        {employee.daysUsed} {t('jours')}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bgColor}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                        <span className={`text-[11px] font-medium ${status.textColor}`}>
                          {status.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEmployee(employee)
                        }}
                        className="text-xs font-medium text-[#6B7280] hover:text-navy transition-colors px-2 py-1"
                      >
                        {t('details')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Floating FAB - Only show on home page when no modals are open */}
      {isHomePage && (
        <button
          onClick={() => setShowAddEmployee(true)}
          className={`fixed bottom-8 right-8 w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-white shadow-modal hover:bg-navy-dark hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300 group z-50 ${
            isAnyModalOpen ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <Plus className="w-6 h-6 group-hover:w-7 group-hover:h-7 transition-all duration-300" strokeWidth={2.5} />
        </button>
      )}

      {/* Employee Detail Panel */}
      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onUpdate={refetch}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
        onSubmit={handleAddEmployeeSubmit}
      />

      {/* Add Day Off Modal */}
      <AddDayOffModal
        employee={dayOffEmployee}
        isOpen={!!dayOffEmployee}
        onClose={() => setDayOffEmployee(null)}
        onSubmit={handleAddDayOffSubmit}
      />
    </div>
  )
}

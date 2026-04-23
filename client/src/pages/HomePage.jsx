import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import EmployeeCard from '../components/EmployeeCard'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AddEmployeeModal from '../components/AddEmployeeModal'
import AddDayOffModal from '../components/AddDayOffModal'
import { useEmployees } from '../hooks/useEmployees'
import { useDaysOff } from '../hooks/useDaysOff'

export default function HomePage() {
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
      actif: 'actifs',
      risque: 'à risque',
      bloqué: 'bloqués',
    }
    return `Affichage : ${count} employé${count > 1 ? 's' : ''} ${labels[activeFilter]}`
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
              Erreur de chargement
            </div>
            <p className="text-sm text-[#374151] mt-1">{error}</p>
            <button
              onClick={refetch}
              className="text-sm text-navy hover:underline mt-2"
            >
              Réessayer
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
          {/* Sliding background indicator */}
          <div
            className="absolute h-full bg-white shadow-md rounded-xl transition-all duration-250 ease-out"
            style={{
              width: '24%',
              left: activeFilter === null
                ? '0.5%'
                : activeFilter === 'actif'
                ? '25.5%'
                : activeFilter === 'risque'
                ? '50.5%'
                : '75.5%',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Tabs */}
          <button
            onClick={() => setActiveFilter(null)}
            className={`relative z-10 flex-1 rounded-xl px-5 py-3 text-center transition-all duration-200 ${
              activeFilter === null
                ? 'text-gray-900 scale-[1.03]'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">Employés</div>
          </button>

          <button
            onClick={() => setActiveFilter('actif')}
            className={`relative z-10 flex-1 rounded-xl px-5 py-3 text-center transition-all duration-200 ${
              activeFilter === 'actif'
                ? 'text-gray-900 scale-[1.03]'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div className="text-2xl font-bold">{stats.actif}</div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">Actifs</div>
          </button>

          <button
            onClick={() => setActiveFilter('risque')}
            className={`relative z-10 flex-1 rounded-xl px-5 py-3 text-center transition-all duration-200 ${
              activeFilter === 'risque'
                ? 'text-gray-900 scale-[1.03]'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div className="text-2xl font-bold">{stats.risque}</div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">À risque</div>
          </button>

          <button
            onClick={() => setActiveFilter('bloqué')}
            className={`relative z-10 flex-1 rounded-xl px-5 py-3 text-center transition-all duration-200 ${
              activeFilter === 'bloqué'
                ? 'text-gray-900 scale-[1.03]'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div className="text-2xl font-bold">{stats.bloqué}</div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">Bloqués</div>
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
      <h2 className="text-xs uppercase tracking-widest text-[#6B7280] font-semibold mb-4 mt-8 animate-fade-up" style={{ animationDelay: '0.4s' }}>
        Activité récente
      </h2>

      {/* Employee list */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center shadow-ambient">
          <p className="text-[#6B7280]">Aucun employé trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.slice(0, 5).map((employee, index) => (
            <div key={employee.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <EmployeeCard
                employee={employee}
                onDetailsClick={() => setSelectedEmployee(employee)}
              />
            </div>
          ))}
        </div>
      )}

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

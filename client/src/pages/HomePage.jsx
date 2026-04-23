import { useState } from 'react'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import EmployeeCard from '../components/EmployeeCard'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AddEmployeeModal from '../components/AddEmployeeModal'
import { useEmployees } from '../hooks/useEmployees'

export default function HomePage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)
  const { employees, loading, error, refetch, addEmployee } = useEmployees()

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
      {/* Stat cards row - Interactive filters */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div style={{ animationDelay: '0s' }} className="animate-fade-up">
          <StatCard
            number={stats.total}
            label="Employés"
            isActive={activeFilter === null}
            isFilterActive={activeFilter !== null}
            onClick={() => setActiveFilter(null)}
          />
        </div>
        <div style={{ animationDelay: '0.1s' }} className="animate-fade-up">
          <StatCard
            number={stats.actif}
            label="Actifs"
            isActive={activeFilter === 'actif'}
            isFilterActive={activeFilter !== null}
            onClick={() => setActiveFilter('actif')}
          />
        </div>
        <div style={{ animationDelay: '0.2s' }} className="animate-fade-up">
          <StatCard
            number={stats.risque}
            label="À risque"
            dot="amber"
            isActive={activeFilter === 'risque'}
            isFilterActive={activeFilter !== null}
            onClick={() => setActiveFilter('risque')}
          />
        </div>
        <div style={{ animationDelay: '0.3s' }} className="animate-fade-up">
          <StatCard
            number={stats.bloqué}
            label="Bloqués"
            dot="red"
            isActive={activeFilter === 'bloqué'}
            isFilterActive={activeFilter !== null}
            onClick={() => setActiveFilter('bloqué')}
          />
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

      {/* Floating FAB */}
      <button
        onClick={() => setShowAddEmployee(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-white shadow-modal hover:bg-navy-dark hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300 group z-50"
      >
        <Plus className="w-6 h-6 group-hover:w-7 group-hover:h-7 transition-all duration-300" strokeWidth={2.5} />
      </button>

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
    </div>
  )
}

function StatCard({ number, label, dot, isActive, isFilterActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-ambient hover:shadow-modal transition-all duration-200 group cursor-pointer text-left w-full ${
        isActive
          ? 'scale-[1.02] shadow-modal border-b-2 border-navy'
          : isFilterActive
          ? 'opacity-70'
          : ''
      }`}
    >
      <div className="flex items-baseline gap-2">
        <div className={`font-display text-5xl font-bold tabular-nums transition-colors duration-300 ${
          isActive ? 'text-navy' : 'text-[#111827] group-hover:text-navy'
        }`}>{number}</div>
        {dot && (
          <div
            className={`w-2 h-2 rounded-full ${
              dot === 'amber' ? 'bg-status-amber' : 'bg-status-red'
            } ${isActive ? 'scale-125' : 'group-hover:scale-125'} transition-transform duration-300`}
          />
        )}
      </div>
      <div className="text-sm text-[#6B7280] mt-3 font-medium">{label}</div>
    </button>
  )
}

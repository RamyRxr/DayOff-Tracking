import { useState } from 'react'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import EmployeeCard from '../components/EmployeeCard'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AddEmployeeModal from '../components/AddEmployeeModal'
import { useEmployees } from '../hooks/useEmployees'

export default function HomePage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const { employees, loading, error, refetch, addEmployee } = useEmployees()

  // Calculate stats from employees data
  const stats = {
    total: employees.length,
    actif: employees.filter((e) => e.status === 'actif').length,
    risque: employees.filter((e) => e.status === 'risque').length,
    bloqué: employees.filter((e) => e.status === 'bloqué').length,
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
      {/* Stat cards row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div style={{ animationDelay: '0s' }} className="animate-fade-up">
          <StatCard number={stats.total} label="Employés" />
        </div>
        <div style={{ animationDelay: '0.1s' }} className="animate-fade-up">
          <StatCard number={stats.actif} label="Actifs" />
        </div>
        <div style={{ animationDelay: '0.2s' }} className="animate-fade-up">
          <StatCard number={stats.risque} label="À risque" dot="amber" />
        </div>
        <div style={{ animationDelay: '0.3s' }} className="animate-fade-up">
          <StatCard number={stats.bloqué} label="Bloqués" dot="red" />
        </div>
      </div>

      {/* Section label */}
      <h2 className="text-xs uppercase tracking-wider text-[#6B7280] mb-4 mt-8">
        Activité récente
      </h2>

      {/* Employee list */}
      {employees.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center shadow-ambient">
          <p className="text-[#6B7280]">Aucun employé trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.slice(0, 5).map((employee, index) => (
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
        className="fixed bottom-8 right-8 w-[52px] h-[52px] bg-navy rounded-full flex items-center justify-center text-white shadow-modal hover:shadow-ambient hover:scale-105 transition-all duration-200"
      >
        <Plus className="w-6 h-6" strokeWidth={2} />
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

function StatCard({ number, label, dot }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-ambient hover:shadow-modal hover:scale-[1.02] transition-all duration-300 group cursor-default">
      <div className="flex items-baseline gap-2">
        <div className="font-display text-5xl font-bold text-[#111827] tabular-nums group-hover:text-navy transition-colors duration-300">{number}</div>
        {dot && (
          <div
            className={`w-2 h-2 rounded-full ${
              dot === 'amber' ? 'bg-status-amber' : 'bg-status-red'
            } group-hover:scale-125 transition-transform duration-300`}
          />
        )}
      </div>
      <div className="text-sm text-[#6B7280] mt-3 font-medium">{label}</div>
    </div>
  )
}

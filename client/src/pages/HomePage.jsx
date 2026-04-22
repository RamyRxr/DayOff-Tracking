import { useState } from 'react'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import EmployeeCard from '../components/EmployeeCard'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import { useEmployees } from '../hooks/useEmployees'

export default function HomePage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const { employees, loading, error, refetch } = useEmployees()

  // Calculate stats from employees data
  const stats = {
    total: employees.length,
    actif: employees.filter((e) => e.status === 'actif').length,
    risque: employees.filter((e) => e.status === 'risque').length,
    bloqué: employees.filter((e) => e.status === 'bloqué').length,
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
      <div className="bg-apple-red/10 border border-apple-red/20 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-apple-red" />
          <div>
            <div className="font-semibold text-apple-red">
              Erreur de chargement
            </div>
            <p className="text-sm text-gray-700 mt-1">{error}</p>
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
        <StatCard number={stats.total} label="Employés" />
        <StatCard number={stats.actif} label="Actifs" />
        <StatCard number={stats.risque} label="À risque" dot="amber" />
        <StatCard number={stats.bloqué} label="Bloqués" dot="red" />
      </div>

      {/* Section label */}
      <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-4 mt-8">
        Activité récente
      </h2>

      {/* Employee list */}
      {employees.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center shadow-ambient">
          <p className="text-gray-500">Aucun employé trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.slice(0, 5).map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onDetailsClick={() => setSelectedEmployee(employee)}
            />
          ))}
        </div>
      )}

      {/* Floating FAB */}
      <button className="fixed bottom-8 right-8 w-[52px] h-[52px] bg-navy rounded-full flex items-center justify-center text-white shadow-modal hover:shadow-ambient hover:scale-105 transition-all duration-200">
        <Plus className="w-6 h-6" strokeWidth={2} />
      </button>

      {/* Employee Detail Panel */}
      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
      />
    </div>
  )
}

function StatCard({ number, label, dot }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-ambient hover:shadow-modal transition-shadow duration-200">
      <div className="flex items-baseline gap-2">
        <div className="text-4xl font-bold text-gray-900">{number}</div>
        {dot && (
          <div
            className={`w-2 h-2 rounded-full ${
              dot === 'amber' ? 'bg-apple-amber' : 'bg-apple-red'
            }`}
          />
        )}
      </div>
      <div className="text-sm text-gray-600 mt-2">{label}</div>
    </div>
  )
}

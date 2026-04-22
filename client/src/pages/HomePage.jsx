import { useState } from 'react'
import { Plus } from 'lucide-react'
import EmployeeCard from '../components/EmployeeCard'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'

// Mock NAFTAL employee data
const mockEmployees = [
  {
    id: 1,
    name: 'Ahmed Benali',
    matricule: 'NAF-2847',
    department: 'Direction Commerciale',
    position: 'Chef de Projet',
    daysUsed: 12,
    daysTotal: 30,
    status: 'actif',
    avatar: 'AB',
  },
  {
    id: 2,
    name: 'Fatima Zerrouki',
    matricule: 'NAF-3102',
    department: 'Ressources Humaines',
    position: 'Responsable RH',
    daysUsed: 8,
    daysTotal: 30,
    status: 'actif',
    avatar: 'FZ',
  },
  {
    id: 3,
    name: 'Karim Boudiaf',
    matricule: 'NAF-2956',
    department: 'Logistique',
    position: 'Superviseur',
    daysUsed: 18,
    daysTotal: 30,
    status: 'risque',
    avatar: 'KB',
  },
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
  },
  {
    id: 5,
    name: 'Rachid Meziane',
    matricule: 'NAF-2741',
    department: 'IT',
    position: 'Développeur',
    daysUsed: 6,
    daysTotal: 30,
    status: 'actif',
    avatar: 'RM',
  },
]

export default function HomePage() {
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  return (
    <div>
      {/* Stat cards row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard number="47" label="Employés" />
        <StatCard number="41" label="Actifs" />
        <StatCard number="4" label="À risque" dot="amber" />
        <StatCard number="2" label="Bloqués" dot="red" />
      </div>

      {/* Section label */}
      <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-4 mt-8">
        Activité récente
      </h2>

      {/* Employee list */}
      <div className="space-y-3">
        {mockEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onDetailsClick={() => setSelectedEmployee(employee)}
          />
        ))}
      </div>

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

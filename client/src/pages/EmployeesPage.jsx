import { useState } from 'react'
import { Search, Filter, Plus, ChevronDown, Loader2 } from 'lucide-react'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AddDayOffModal from '../components/AddDayOffModal'
import { useEmployees } from '../hooks/useEmployees'

export default function EmployeesPage() {
  const { employees, loading, error } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('tous')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddDayOff, setShowAddDayOff] = useState(false)
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'tous' || emp.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort employees
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aVal, bVal

    if (sortField === 'name') {
      aVal = a.name
      bVal = b.name
    } else if (sortField === 'daysUsed') {
      aVal = a.daysUsed
      bVal = b.daysUsed
    } else if (sortField === 'status') {
      aVal = a.status
      bVal = b.status
    }

    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const statusConfig = {
    actif: {
      label: 'Actif',
      dotColor: 'bg-status-green',
      bgColor: 'bg-status-green/10',
      textColor: 'text-status-green',
    },
    risque: {
      label: 'À risque',
      dotColor: 'bg-status-amber',
      bgColor: 'bg-status-amber/10',
      textColor: 'text-status-amber',
    },
    bloqué: {
      label: 'Bloqué',
      dotColor: 'bg-status-red',
      bgColor: 'bg-status-red/10',
      textColor: 'text-status-red',
    },
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
        <div className="font-semibold text-status-red mb-2">
          Erreur de chargement
        </div>
        <p className="text-sm text-[#374151]">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Employés
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Gérez tous les employés et leurs congés
          </p>
        </div>
        <button
          onClick={() => {}}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Nouvel employé
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-ambient mb-6">
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule ou département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-warm-gray-200 rounded-xl text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-warm-gray-200 rounded-xl text-[#111827] font-medium text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all"
            >
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actifs</option>
              <option value="risque">À risque</option>
              <option value="bloqué">Bloqués</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[#6B7280] mb-3">
        {sortedEmployees.length} employé{sortedEmployees.length > 1 ? 's' : ''}{' '}
        {statusFilter !== 'tous' && `(${statusConfig[statusFilter]?.label})`}
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-ambient overflow-hidden">
        <table className="w-full">
          <thead className="bg-warm-gray-200 border-b border-warm-gray-400">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="text-left px-6 py-3 text-xs font-semibold text-[#374151] uppercase tracking-wider cursor-pointer hover:bg-warm-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Employé
                  {sortField === 'name' && (
                    <span className="text-navy">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#374151] uppercase tracking-wider">
                Département
              </th>
              <th
                onClick={() => handleSort('daysUsed')}
                className="text-left px-6 py-3 text-xs font-semibold text-[#374151] uppercase tracking-wider cursor-pointer hover:bg-warm-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Congés
                  {sortField === 'daysUsed' && (
                    <span className="text-navy">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="text-left px-6 py-3 text-xs font-semibold text-[#374151] uppercase tracking-wider cursor-pointer hover:bg-warm-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  Statut
                  {sortField === 'status' && (
                    <span className="text-navy">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-[#374151] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-gray-300">
            {sortedEmployees.map((employee) => {
              const status = statusConfig[employee.status]
              const progressPercent =
                (employee.daysUsed / employee.daysTotal) * 100

              return (
                <tr
                  key={employee.id}
                  className="hover:bg-warm-gray-200/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151] flex-shrink-0">
                        {employee.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-[#111827]">
                          {employee.name}
                        </div>
                        <div className="text-xs font-mono text-[#6B7280]">
                          {employee.matricule}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#111827]">
                      {employee.department}
                    </div>
                    <div className="text-xs text-[#6B7280]">
                      {employee.position}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#111827] mb-1">
                      {employee.daysUsed} / {employee.daysTotal} jours
                    </div>
                    <div className="w-24 h-1.5 bg-warm-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-navy transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bgColor}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
                      <span className={`text-xs font-medium ${status.textColor}`}>
                        {status.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEmployee(employee)
                        }}
                        className="text-xs font-medium text-[#6B7280] hover:text-navy transition-colors px-2 py-1"
                      >
                        Détails
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEmployee(employee)
                          setShowAddDayOff(true)
                        }}
                        className="text-xs font-medium text-navy hover:text-navy/80 transition-colors px-2 py-1"
                      >
                        + Congé
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {sortedEmployees.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[#6B7280]">Aucun employé trouvé</p>
          </div>
        )}
      </div>

      {/* Employee Detail Panel */}
      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={!!selectedEmployee && !showAddDayOff}
        onClose={() => setSelectedEmployee(null)}
      />

      {/* Add Day Off Modal */}
      <AddDayOffModal
        employee={selectedEmployee}
        isOpen={showAddDayOff}
        onClose={() => {
          setShowAddDayOff(false)
          setSelectedEmployee(null)
        }}
        onSubmit={(data) => {
          console.log('Add day off:', data)
        }}
      />
    </div>
  )
}

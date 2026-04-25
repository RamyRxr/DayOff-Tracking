import { useState } from 'react'
import { Search, Filter, Plus, ChevronDown, Loader2 } from 'lucide-react'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AddDayOffModal from '../components/AddDayOffModal'
import AddEmployeeModal from '../components/AddEmployeeModal'
import CustomSelect from '../components/CustomSelect'
import { useEmployees } from '../hooks/useEmployees'

export default function EmployeesPage() {
  const { employees, loading, error, refetch } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('tous')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddDayOff, setShowAddDayOff] = useState(false)
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const isDark = document.documentElement.classList.contains('dark')

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
      dotColor: 'bg-status-green dark:bg-[#34C759]',
      bgColor: 'bg-status-green/10 dark:bg-[rgba(52,199,89,0.15)] border border-transparent dark:border-[rgba(52,199,89,0.2)]',
      textColor: 'text-status-green dark:text-[#34C759]',
    },
    risque: {
      label: 'À risque',
      dotColor: 'bg-status-amber dark:bg-[#FF9F0A]',
      bgColor: 'bg-status-amber/10 dark:bg-[rgba(255,159,10,0.15)] border border-transparent dark:border-[rgba(255,159,10,0.2)]',
      textColor: 'text-status-amber dark:text-[#FF9F0A]',
    },
    bloqué: {
      label: 'Bloqué',
      dotColor: 'bg-status-red dark:bg-[#FF6B6B]',
      bgColor: 'bg-status-red/10 dark:bg-[rgba(192,57,43,0.2)] border border-transparent dark:border-[rgba(255,59,48,0.2)]',
      textColor: 'text-status-red dark:text-[#FF6B6B]',
    },
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-navy dark:text-[#2C4A6F] animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-status-red/10 dark:bg-[rgba(192,57,43,0.2)] border border-status-red/20 dark:border-[rgba(255,59,48,0.2)] rounded-2xl p-6">
        <div className="font-semibold text-status-red dark:text-[#FF6B6B] mb-2">
          Erreur de chargement
        </div>
        <p className="text-sm text-[#374151] dark:text-[#8E8E93]">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#111827] dark:text-[#F2F2F7]">
            Employés
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#8E8E93] mt-2 font-medium">
            Gérez tous les employés et leurs congés
          </p>
        </div>
        <button
          onClick={() => setShowAddEmployeeModal(true)}
          className="flex items-center gap-2 bg-navy dark:bg-transparent text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
          style={isDark ? {
            background: 'linear-gradient(145deg, #2C4A6F, #1A2F4F)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
          } : {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Nouvel employé
        </button>
      </div>

      {/* Filters */}
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-black/6 dark:border-white/[0.07]"
        style={isDark ? {
          backgroundColor: '#16161E',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset'
        } : {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] dark:text-[#8E8E93] pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule ou département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl text-[#111827] dark:text-[#F2F2F7] placeholder-[#6B7280] dark:placeholder-[#48484A] focus:outline-none transition-all"
              style={isDark ? {
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)'
              } : {}}
              onFocus={(e) => {
                if (isDark) {
                  e.target.style.boxShadow = '0 0 0 2px #2C4A6F, inset 0 1px 3px rgba(0,0,0,0.2)'
                  e.target.style.background = 'rgba(255,255,255,0.08)'
                }
              }}
              onBlur={(e) => {
                if (isDark) {
                  e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)'
                  e.target.style.background = 'rgba(255,255,255,0.06)'
                }
              }}
            />
          </div>

          {/* Status filter */}
          <CustomSelect
            options={[
              { value: 'tous', label: 'Tous les statuts' },
              { value: 'actif', label: 'Actifs' },
              { value: 'risque', label: 'À risque' },
              { value: 'bloqué', label: 'Bloqués' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filtrer par statut"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[#6B7280] dark:text-[#8E8E93] mb-3">
        {sortedEmployees.length} employé{sortedEmployees.length > 1 ? 's' : ''}{' '}
        {statusFilter !== 'tous' && `(${statusConfig[statusFilter]?.label})`}
      </div>

      {/* Table */}
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-black/6 dark:border-white/[0.07]"
        style={isDark ? {
          backgroundColor: '#16161E',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset'
        } : {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <table className="w-full">
          <thead className="bg-warm-gray-200 dark:bg-white/[0.04] border-b border-warm-gray-400 dark:border-white/[0.06]">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="text-left px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#8E8E93] uppercase tracking-wider cursor-pointer hover:bg-warm-gray-300 dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2">
                  Employé
                  {sortField === 'name' && (
                    <span className="text-navy dark:text-[#5E9FFF]">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#8E8E93] uppercase tracking-wider">
                Département
              </th>
              <th
                onClick={() => handleSort('daysUsed')}
                className="text-left px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#8E8E93] uppercase tracking-wider cursor-pointer hover:bg-warm-gray-300 dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2">
                  Congés
                  {sortField === 'daysUsed' && (
                    <span className="text-navy dark:text-[#5E9FFF]">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="text-left px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#8E8E93] uppercase tracking-wider cursor-pointer hover:bg-warm-gray-300 dark:hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2">
                  Statut
                  {sortField === 'status' && (
                    <span className="text-navy dark:text-[#5E9FFF]">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#8E8E93] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-gray-300 dark:divide-white/[0.06]">
            {sortedEmployees.map((employee) => {
              const status = statusConfig[employee.status]
              const progressPercent =
                (employee.daysUsed / employee.daysTotal) * 100

              return (
                <tr
                  key={employee.id}
                  className="hover:bg-warm-gray-200/50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warm-gray-200 dark:bg-white/[0.06] flex items-center justify-center text-sm font-semibold text-[#374151] dark:text-[#8E8E93] flex-shrink-0">
                        {employee.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-[#111827] dark:text-[#F2F2F7]">
                          {employee.name}
                        </div>
                        <div className="text-xs font-mono text-[#6B7280] dark:text-[#8E8E93]">
                          {employee.matricule}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#111827] dark:text-[#F2F2F7]">
                      {employee.department}
                    </div>
                    <div className="text-xs text-[#6B7280] dark:text-[#8E8E93]">
                      {employee.position}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm mb-1 font-medium ${
                      employee.daysUsed >= 14
                        ? 'text-red-600 dark:text-[#FF6B6B]'
                        : employee.daysUsed >= 11
                          ? 'text-amber-600 dark:text-[#FF9F0A]'
                          : 'text-gray-700 dark:text-[#F2F2F7]'
                    }`}>
                      {employee.daysUsed} / 15 jours
                    </div>
                    <div className="w-24 h-1.5 bg-warm-gray-300 dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          employee.daysUsed >= 14
                            ? 'bg-red-500 dark:bg-[#FF6B6B]'
                            : employee.daysUsed >= 11
                              ? 'bg-amber-500 dark:bg-[#FF9F0A]'
                              : 'bg-navy dark:bg-[#2C4A6F]'
                        }`}
                        style={{ width: `${(employee.daysUsed / 15) * 100}%` }}
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
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEmployee(employee)
                        }}
                        className="text-xs font-medium text-gray-600 dark:text-[#8E8E93] hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all px-3 py-1.5 rounded-lg"
                      >
                        Détails
                      </button>
                      {employee.status !== 'bloqué' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (employee.daysUsed >= 15) {
                              setSelectedEmployee(employee)
                              // Trigger block modal (would need to add state for this)
                            }
                          }}
                          disabled={employee.daysUsed < 15}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                            employee.daysUsed >= 15
                              ? 'text-red-600 dark:text-[#FF6B6B] hover:bg-red-50 dark:hover:bg-[rgba(192,57,43,0.15)] cursor-pointer'
                              : 'text-gray-400 dark:text-[#636366] opacity-40 cursor-not-allowed'
                          }`}
                          title={
                            employee.daysUsed < 15
                              ? 'Le blocage est possible après 15 jours de congé'
                              : 'Bloquer cet employé'
                          }
                        >
                          Bloquer
                        </button>
                      )}
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
            <p className="text-[#6B7280] dark:text-[#8E8E93]">Aucun employé trouvé</p>
          </div>
        )}
      </div>

      {/* Employee Detail Panel */}
      <EmployeeDetailPanel
        employee={selectedEmployee}
        isOpen={!!selectedEmployee && !showAddDayOff}
        onClose={() => setSelectedEmployee(null)}
        onUpdate={refetch}
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

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <AddEmployeeModal
          onClose={() => setShowAddEmployeeModal(false)}
          onSuccess={() => {
            setShowAddEmployeeModal(false)
            refetch()
          }}
        />
      )}
    </div>
  )
}

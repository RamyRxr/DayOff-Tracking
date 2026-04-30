import { useState, useEffect } from 'react'
import { Search, Filter, Plus, ChevronDown, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AddDayOffModal from '../components/AddDayOffModal'
import AddEmployeeModal from '../components/AddEmployeeModal'
import CustomSelect from '../components/CustomSelect'
import EmployeeTable from '../components/EmployeeTable'
import { useEmployees } from '../hooks/useEmployees'
import { useTheme } from '../contexts/ThemeContext'
import { translateDepartment } from '../utils/translateDepartment'

export default function EmployeesPage() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const { employees, loading, error, refetch } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('tous')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddDayOff, setShowAddDayOff] = useState(false)
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // Update selectedEmployee when employees array changes (after refetch)
  useEffect(() => {
    if (selectedEmployee && employees.length > 0) {
      const updatedEmployee = employees.find(emp => emp.id === selectedEmployee.id)
      if (updatedEmployee) {
        setSelectedEmployee(updatedEmployee)
      }
    }
  }, [employees])

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
        <Loader2 className="w-8 h-8 text-navy dark:text-[#639DFF] animate-spin" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-status-red/10 border border-status-red/20 rounded-2xl p-6"
        style={isDark ? {
          backgroundColor: 'rgba(192,57,43,0.15)',
          borderColor: 'rgba(255,59,48,0.2)'
        } : {}}
      >
        <div className="font-semibold text-status-red dark:text-[#FF6B6B] mb-2">
          {t('erreurChargement')}
        </div>
        <p className="text-sm text-[#374151] dark:text-[#7A9CC4]">{error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#111827] dark:text-[#E8EFF8]">
            {t('employes')}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#7A9CC4] mt-2 font-medium">
            {t('gerezEmployes')}
          </p>
        </div>
        <button
          onClick={() => setShowAddEmployeeModal(true)}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
          style={isDark ? {
            background: 'linear-gradient(145deg, #2A5494, #1E3D6B)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.5)'
          } : {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          {t('nouvelEmploye')}
        </button>
      </div>

      {/* Filters */}
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 mb-6 border border-black/6 dark:border-white/[0.07]"
        style={isDark ? {
          backgroundColor: 'rgba(13,21,38,0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        } : {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4] pointer-events-none" />
            <input
              type="text"
              placeholder={t('rechercherNomMatriculeDept')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-warm-gray-200 rounded-xl text-[#111827] placeholder-[#6B7280] focus:outline-none transition-all"
              style={isDark ? {
                backgroundColor: 'rgba(13,21,38,0.75)',
                color: '#E8EFF8',
                borderColor: 'rgba(99,157,255,0.12)',
                border: '1px solid',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)'
              } : {}}
              onFocus={(e) => {
                if (isDark) {
                  e.target.style.boxShadow = '0 0 0 2px rgba(99,157,255,0.3), inset 0 1px 3px rgba(0,0,0,0.2)'
                  e.target.style.backgroundColor = 'rgba(13,21,38,0.9)'
                }
              }}
              onBlur={(e) => {
                if (isDark) {
                  e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.4)'
                  e.target.style.backgroundColor = 'rgba(13,21,38,0.75)'
                }
              }}
            />
          </div>

          {/* Status filter */}
          <CustomSelect
            options={[
              { value: 'tous', label: t('tousLesStatuts') },
              { value: 'actif', label: t('actifs') },
              { value: 'risque', label: t('aRisque') },
              { value: 'bloqué', label: t('bloques') },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder={t('filtrerParStatut')}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4] mb-3">
        {sortedEmployees.length} employé{sortedEmployees.length > 1 ? 's' : ''}{' '}
        {statusFilter !== 'tous' && `(${statusConfig[statusFilter]?.label})`}
      </div>

      {/* Table */}
      <EmployeeTable
        employees={sortedEmployees}
        onDetails={(emp) => setSelectedEmployee(emp)}
        isDark={isDark}
      />

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

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import EmployeeCard from '../components/EmployeeCard'
import EmployeeDetailPanel from '../components/EmployeeDetailPanel'
import AddEmployeeModal from '../components/AddEmployeeModal'
import AddDayOffModal from '../components/AddDayOffModal'
import HomeAddDayOffModal from '../components/HomeAddDayOffModal'
import { useEmployees } from '../hooks/useEmployees'
import { useDaysOff } from '../hooks/useDaysOff'
import { useTheme } from '../contexts/ThemeContext'
import { translateDepartment } from '../utils/translateDepartment'

export default function HomePage() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const location = useLocation()
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showHomeAddDayOff, setShowHomeAddDayOff] = useState(false)
  const [dayOffEmployee, setDayOffEmployee] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  const { employees, loading, error, refetch, addEmployee } = useEmployees()
  const { addDayOff } = useDaysOff({ employeeId: dayOffEmployee?.id })

  const isHomePage = location.pathname === '/'
  const isAnyModalOpen = !!selectedEmployee || showAddEmployee || showHomeAddDayOff || !!dayOffEmployee

  // Refetch employees when component mounts (ensures fresh data after navigation)
  useEffect(() => {
    refetch()
  }, [refetch])

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
      alert(`❌ ${t('erreur')}: ${error.message}`)
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
      alert(`❌ ${t('erreur')}: ${error.message}`)
    }
  }

  const handleHomeAddDayOffSuccess = () => {
    setShowHomeAddDayOff(false)
    refetch()
    alert('✅ Congé ajouté avec succès')
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
      <div className="bg-status-red/10 dark:bg-[rgba(192,57,43,0.15)] border border-status-red/20 dark:border-[rgba(255,59,48,0.2)] rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-status-red dark:text-[#FF6B6B]" />
          <div>
            <div className="font-semibold text-status-red dark:text-[#FF6B6B]">
              {t('erreurChargement')}
            </div>
            <p className="text-sm text-[#374151] dark:text-[#7A9CC4] mt-1">{error}</p>
            <button
              onClick={refetch}
              className="text-sm text-navy dark:text-[#639DFF] hover:underline mt-2"
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
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 mb-6 animate-fade-up border border-black/6 dark:border-white/[0.07]"
        style={isDark ? {
          backgroundColor: 'rgba(13,21,38,0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset'
        } : {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div className="relative flex items-center justify-between gap-4 px-2">
          {/* Employés pill */}
          <button
            onClick={() => setActiveFilter(null)}
            className={`relative z-10 flex-1 min-w-[120px] rounded-xl px-5 py-3 text-center border transition-all duration-200 backdrop-blur-[8px] ${
              activeFilter === null
                ? 'bg-white text-gray-900 font-semibold border-black/[0.08] scale-[1.03]'
                : 'bg-white/60 text-gray-500 border-black/[0.06] hover:bg-white/85 hover:text-gray-700 hover:scale-[1.02]'
            }`}
            style={isDark ? (
              activeFilter === null
                ? {
                    backgroundColor: 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)'
                  }
                : {
                    backgroundColor: 'rgba(99,157,255,0.04)',
                    color: '#7A9CC4'
                  }
            ) : {
              boxShadow: activeFilter === null
                ? 'inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== null) {
                if (isDark) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                  e.currentTarget.style.color = '#E8EFF8'
                } else {
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.08)'
                }
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== null) {
                if (isDark) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.04)'
                  e.currentTarget.style.color = '#7A9CC4'
                } else {
                  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)'
                }
              }
            }}
          >
            <div className="text-[22px] font-bold">{stats.total}</div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">{t('totalEmployes')}</div>
          </button>

          {/* Divider */}
          <div
            className="w-px h-8 bg-gray-100 self-center"
            style={isDark ? { backgroundColor: 'rgba(99,157,255,0.12)' } : {}}
          />

          {/* Actifs pill */}
          <button
            onClick={() => setActiveFilter('actif')}
            className={`relative z-10 flex-1 min-w-[120px] rounded-xl px-5 py-3 text-center border transition-all duration-200 backdrop-blur-[8px] ${
              activeFilter === 'actif'
                ? 'bg-white text-gray-900 font-semibold border-black/[0.08] scale-[1.03]'
                : 'bg-white/60 text-gray-500 border-black/[0.06] hover:bg-white/85 hover:text-gray-700 hover:scale-[1.02]'
            }`}
            style={isDark ? (
              activeFilter === 'actif'
                ? {
                    backgroundColor: 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)'
                  }
                : {
                    backgroundColor: 'rgba(99,157,255,0.04)',
                    color: '#7A9CC4'
                  }
            ) : {
              boxShadow: activeFilter === 'actif'
                ? 'inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== 'actif') {
                if (isDark) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                  e.currentTarget.style.color = '#E8EFF8'
                } else {
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.08)'
                }
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== 'actif') {
                if (isDark) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.04)'
                  e.currentTarget.style.color = '#7A9CC4'
                } else {
                  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)'
                }
              }
            }}
          >
            <div className="text-[22px] font-bold">{stats.actif}</div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">{t('actifs')}</div>
          </button>

          {/* Divider */}
          <div
            className="w-px h-8 bg-gray-100 self-center"
            style={isDark ? { backgroundColor: 'rgba(99,157,255,0.12)' } : {}}
          />

          {/* À risque pill */}
          <button
            onClick={() => setActiveFilter('risque')}
            className={`relative z-10 flex-1 min-w-[120px] rounded-xl px-5 py-3 text-center border transition-all duration-200 backdrop-blur-[8px] ${
              activeFilter === 'risque'
                ? 'bg-white text-gray-900 font-semibold border-black/[0.08] scale-[1.03]'
                : 'bg-white/60 text-gray-500 border-black/[0.06] hover:bg-white/85 hover:text-gray-700 hover:scale-[1.02]'
            }`}
            style={isDark ? (
              activeFilter === 'risque'
                ? {
                    backgroundColor: 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)'
                  }
                : {
                    backgroundColor: 'rgba(99,157,255,0.04)',
                    color: '#7A9CC4'
                  }
            ) : {
              boxShadow: activeFilter === 'risque'
                ? 'inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== 'risque') {
                if (isDark) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                  e.currentTarget.style.color = '#E8EFF8'
                } else {
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.08)'
                }
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== 'risque') {
                if (isDark) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.04)'
                  e.currentTarget.style.color = '#7A9CC4'
                } else {
                  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)'
                }
              }
            }}
          >
            <div className={`text-[22px] font-bold ${activeFilter === 'risque' ? 'text-amber-600 dark:text-[#FF9F0A]' : ''}`}>
              {stats.risque}
            </div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">{t('aRisque')}</div>
          </button>

          {/* Divider */}
          <div
            className="w-px h-8 bg-gray-100 self-center"
            style={isDark ? { backgroundColor: 'rgba(99,157,255,0.12)' } : {}}
          />

          {/* Bloqués pill */}
          <button
            onClick={() => setActiveFilter('bloqué')}
            className={`relative z-10 flex-1 min-w-[120px] rounded-xl px-5 py-3 text-center border transition-all duration-200 backdrop-blur-[8px] ${
              activeFilter === 'bloqué'
                ? 'bg-white text-gray-900 font-semibold border-black/[0.08] scale-[1.03]'
                : 'bg-white/60 text-gray-500 border-black/[0.06] hover:bg-white/85 hover:text-gray-700 hover:scale-[1.02]'
            }`}
            style={isDark ? (
              activeFilter === 'bloqué'
                ? {
                    backgroundColor: 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.3)'
                  }
                : {
                    backgroundColor: 'rgba(99,157,255,0.04)',
                    color: '#7A9CC4'
                  }
            ) : {
              boxShadow: activeFilter === 'bloqué'
                ? 'inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)'
                : 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              if (activeFilter !== 'bloqué') {
                if (isDark) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                  e.currentTarget.style.color = '#E8EFF8'
                } else {
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.08)'
                }
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter !== 'bloqué') {
                if (isDark) {
                  e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.04)'
                  e.currentTarget.style.color = '#7A9CC4'
                } else {
                  e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.04)'
                }
              }
            }}
          >
            <div className={`text-[22px] font-bold ${activeFilter === 'bloqué' ? 'text-red-600 dark:text-[#FF6B6B]' : ''}`}>
              {stats.bloqué}
            </div>
            <div className="text-[11px] uppercase tracking-wider mt-0.5">{t('bloques')}</div>
          </button>
        </div>
      </div>

      {/* Filter label */}
      {getFilterLabel() && (
        <div className="text-sm text-[#6B7280] dark:text-[#7A9CC4] font-medium mb-4">
          {getFilterLabel()}
        </div>
      )}

      {/* Section label */}
      <h2 className="text-xs uppercase tracking-widest text-[#6B7280] dark:text-[#7A9CC4] font-semibold mb-4 mt-8">
        {t('activiteRecente')}
      </h2>

      {/* Employee table */}
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-black/6 dark:border-white/[0.07]"
        style={isDark ? {
          backgroundColor: 'rgba(13,21,38,0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset'
        } : {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        {filteredEmployees.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#6B7280] dark:text-[#7A9CC4]">{t('aucunEmployeTrouve')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead
              className="bg-warm-gray-200 border-b border-black/6"
              style={isDark ? {
                backgroundColor: 'rgba(99,157,255,0.06)',
                borderColor: 'rgba(99,157,255,0.12)'
              } : {}}
            >
              <tr>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
                  {t('employe')}
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
                  {t('departement')}
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
                  {t('conge')}
                </th>
                <th className="text-left px-6 py-3 text-[11px] font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
                  {t('statut')}
                </th>
                <th className="text-right px-6 py-3 text-[11px] font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-black/6"
              style={isDark ? { borderColor: 'rgba(99,157,255,0.08)' } : {}}
            >
              {filteredEmployees.slice(0, 5).map((employee) => {
                const statusConfig = {
                  actif: {
                    label: t('actif'),
                    dotColor: 'bg-status-green dark:bg-[#34C759]',
                    bgColor: 'bg-status-green/10 dark:bg-[rgba(52,199,89,0.15)] border border-transparent dark:border-[rgba(52,199,89,0.2)]',
                    textColor: 'text-status-green dark:text-[#34C759]'
                  },
                  risque: {
                    label: t('aRisqueStatus'),
                    dotColor: 'bg-status-amber dark:bg-[#FF9F0A]',
                    bgColor: 'bg-status-amber/10 dark:bg-[rgba(255,159,10,0.15)] border border-transparent dark:border-[rgba(255,159,10,0.2)]',
                    textColor: 'text-status-amber dark:text-[#FF9F0A]'
                  },
                  bloqué: {
                    label: t('bloque'),
                    dotColor: 'bg-status-red dark:bg-[#FF6B6B]',
                    bgColor: 'bg-status-red/10 dark:bg-[rgba(192,57,43,0.2)] border border-transparent dark:border-[rgba(255,59,48,0.2)]',
                    textColor: 'text-status-red dark:text-[#FF6B6B]'
                  },
                }
                const status = statusConfig[employee.status] || statusConfig.actif

                return (
                  <tr
                    key={employee.id}
                    className="h-[52px] hover:bg-black/[0.02] transition-colors cursor-pointer"
                    style={isDark ? {} : {}}
                    onMouseEnter={(e) => {
                      if (isDark) {
                        e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.04)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isDark) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full bg-warm-gray-200 flex items-center justify-center text-xs font-semibold text-[#374151]"
                          style={isDark ? {
                            backgroundColor: 'rgba(99,157,255,0.08)',
                            color: '#7A9CC4'
                          } : {}}
                        >
                          {employee.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#111827] dark:text-[#E8EFF8]">
                            {employee.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#6B7280] dark:text-[#7A9CC4]">
                            {employee.matricule}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="inline-block px-2 py-0.5 bg-warm-gray-300 text-[#374151] text-[11px] rounded-md"
                        style={isDark ? {
                          backgroundColor: 'rgba(99,157,255,0.08)',
                          color: '#7A9CC4'
                        } : {}}
                      >
                        {translateDepartment(employee.department, t)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-[#111827] dark:text-[#E8EFF8]">
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
                        className="text-xs font-medium text-[#6B7280] dark:text-[#7A9CC4] hover:text-navy dark:hover:text-[#639DFF] transition-colors px-2 py-1"
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
          onClick={() => setShowHomeAddDayOff(true)}
          className={`fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center text-white hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300 group z-50 ${
            isAnyModalOpen ? 'opacity-0 pointer-events-none' : ''
          }`}
          style={isDark ? {
            background: 'linear-gradient(145deg, #2A5494, #1E3D6B)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.5)'
          } : {
            backgroundColor: '#1E3A5F',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
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

      {/* Home Add Day Off Modal (FAB button) */}
      <HomeAddDayOffModal
        isOpen={showHomeAddDayOff}
        onClose={() => setShowHomeAddDayOff(false)}
        onSuccess={handleHomeAddDayOffSuccess}
      />
    </div>
  )
}

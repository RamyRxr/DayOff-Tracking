import { useTranslation } from 'react-i18next'
import { translateDepartment } from '../utils/translateDepartment'

export default function EmployeeTable({ employees, onDetails, isDark }) {
  const { t } = useTranslation()

  const statusConfig = {
    actif: {
      label: 'Actif',
      dotColor: 'bg-status-green dark:bg-[#34C759]',
      bgColor: 'bg-status-green/10 dark:bg-[rgba(52,199,89,0.15)] border border-transparent dark:border-[rgba(52,199,89,0.2)]',
      textColor: 'text-status-green dark:text-[#34C759]',
    },
    a_risque: {
      label: 'À risque',
      dotColor: 'bg-status-amber dark:bg-[#FF9F0A]',
      bgColor: 'bg-status-amber/10 dark:bg-[rgba(255,159,10,0.15)] border border-transparent dark:border-[rgba(255,159,10,0.2)]',
      textColor: 'text-status-amber dark:text-[#FF9F0A]',
    },
    doit_bloquer: {
      label: t('doitBloquer'),
      dotColor: 'bg-[#FF6B6B]',
      bgColor: 'bg-[rgba(255,107,107,0.15)] border border-[rgba(255,107,107,0.3)]',
      textColor: 'text-[#FF6B6B]',
    },
    bloque: {
      label: 'Bloqué',
      dotColor: 'bg-status-red dark:bg-[#FF6B6B]',
      bgColor: 'bg-status-red/10 dark:bg-[rgba(192,57,43,0.2)] border border-transparent dark:border-[rgba(255,59,48,0.2)]',
      textColor: 'text-status-red dark:text-[#FF6B6B]',
    },
  }

  if (!employees || employees.length === 0) {
    return (
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 text-center border border-black/6 dark:border-white/[0.07]"
        style={isDark ? {
          backgroundColor: 'rgba(13,21,38,0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        } : {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        <p className="text-[#6B7280] dark:text-[#7A9CC4]">{t('aucunEmploye')}</p>
      </div>
    )
  }

  return (
    <div
      className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-black/6 dark:border-white/[0.07]"
      style={isDark ? {
        backgroundColor: 'rgba(13,21,38,0.85)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
      } : {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
    >
      <table className="w-full">
        <thead
          className="bg-warm-gray-200 border-b border-warm-gray-400"
          style={isDark ? {
            backgroundColor: 'rgba(99,157,255,0.06)',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <tr>
            <th className="text-left px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
              {t('employeLabel')}
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
              {t('departement')}
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
              {t('conges')}
            </th>
            <th className="text-left px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
              {t('statut')}
            </th>
            <th className="text-right px-6 py-3 text-xs font-semibold text-[#374151] dark:text-[#7A9CC4] uppercase tracking-wider">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody
          className="divide-y divide-warm-gray-300"
          style={isDark ? { borderColor: 'rgba(99,157,255,0.08)' } : {}}
        >
          {employees.map((employee) => {
            const status = statusConfig[employee.status] || statusConfig.actif

            return (
              <tr
                key={employee.id}
                className="hover:bg-warm-gray-200/50 transition-colors cursor-pointer"
                onClick={() => onDetails?.(employee)}
                onMouseEnter={(e) => {
                  if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151] flex-shrink-0"
                      style={isDark ? {
                        backgroundColor: 'rgba(99,157,255,0.08)',
                        color: '#7A9CC4'
                      } : {}}
                    >
                      {employee.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-[#111827] dark:text-[#E8EFF8]">
                        {employee.name}
                      </div>
                      <div className="text-xs font-mono text-[#6B7280] dark:text-[#7A9CC4]">
                        {employee.matricule}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[#111827] dark:text-[#E8EFF8]">
                    {translateDepartment(employee.department, t)}
                  </div>
                  <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">
                    {employee.position}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm mb-1 font-medium ${
                    employee.daysUsed >= 14
                      ? 'text-red-600 dark:text-[#FF6B6B]'
                      : employee.daysUsed >= 11
                        ? 'text-amber-600 dark:text-[#FF9F0A]'
                        : 'text-gray-700 dark:text-[#E8EFF8]'
                  }`}>
                    {employee.daysUsed} / 15 {t('jours')}
                  </div>
                  <div
                    className="w-24 h-1.5 bg-warm-gray-300 rounded-full overflow-hidden"
                    style={isDark ? { backgroundColor: 'rgba(99,157,255,0.08)' } : {}}
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        employee.daysUsed >= 14
                          ? 'bg-red-500 dark:bg-[#FF6B6B]'
                          : employee.daysUsed >= 11
                            ? 'bg-amber-500 dark:bg-[#FF9F0A]'
                            : 'bg-navy'
                      }`}
                      style={{
                        width: `${(employee.daysUsed / 15) * 100}%`,
                        ...(isDark && employee.daysUsed < 11 ? { background: 'linear-gradient(90deg, #2A5494, #1E3D6B)' } : {})
                      }}
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDetails?.(employee)
                    }}
                    className="text-xs font-medium text-gray-600 dark:text-[#7A9CC4] hover:bg-gray-100 transition-all px-3 py-1.5 rounded-lg"
                    onMouseEnter={(e) => {
                      if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {t('details')}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

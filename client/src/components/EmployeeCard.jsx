import { useState } from 'react'

export default function EmployeeCard({ employee, onDetailsClick, onDayOffClick }) {
  const [isHovered, setIsHovered] = useState(false)

  const statusConfig = {
    actif: {
      label: 'Actif',
      dotColor: 'bg-apple-green',
      bgColor: 'bg-apple-green/10',
      textColor: 'text-apple-green',
    },
    risque: {
      label: 'À risque',
      dotColor: 'bg-apple-amber',
      bgColor: 'bg-apple-amber/10',
      textColor: 'text-apple-amber',
    },
    bloqué: {
      label: 'Bloqué',
      dotColor: 'bg-apple-red',
      bgColor: 'bg-apple-red/10',
      textColor: 'text-apple-red',
    },
  }

  const status = statusConfig[employee.status] || statusConfig.actif
  const progressPercent = (employee.daysUsed / employee.daysTotal) * 100

  return (
    <div
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-ambient hover:shadow-modal transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-warm-gray-400 flex items-center justify-center text-sm font-semibold text-gray-700 flex-shrink-0">
          {employee.avatar}
        </div>

        {/* Name + Matricule + Department */}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-gray-900 truncate">
            {employee.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono text-gray-500">
              {employee.matricule}
            </span>
            <span className="px-2 py-0.5 bg-warm-gray-300 text-gray-700 text-[11px] rounded-md">
              {employee.department}
            </span>
          </div>
        </div>

        {/* Days used + Progress bar */}
        <div className="flex-shrink-0">
          <div className="text-xs text-gray-600 mb-1">
            {employee.daysUsed} / {employee.daysTotal} jours
          </div>
          <div className="w-[100px] h-1 bg-warm-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-navy transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Status badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bgColor} flex-shrink-0`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
          <span className={`text-[11px] font-medium ${status.textColor}`}>
            {status.label}
          </span>
        </div>

        {/* Action buttons (visible on hover) */}
        <div
          className={`flex items-center gap-2 transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDetailsClick?.()
            }}
            className="text-xs font-medium text-gray-600 hover:text-navy transition-colors px-2 py-1"
          >
            Détails
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDayOffClick?.()
            }}
            className="text-xs font-medium text-gray-600 hover:text-navy transition-colors px-2 py-1"
          >
            + Congé
          </button>
        </div>
      </div>
    </div>
  )
}

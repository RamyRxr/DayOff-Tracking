export default function EmployeeCard({ employee, onDetailsClick, onDayOffClick }) {
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

  const status = statusConfig[employee.status] || statusConfig.actif
  const progressPercent = (employee.daysUsed / employee.daysTotal) * 100

  return (
    <div
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-ambient hover:shadow-modal hover:scale-[1.01] transition-all duration-200 cursor-pointer animate-fade-up group"
      onClick={() => onDetailsClick?.()}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151] flex-shrink-0">
          {employee.avatar}
        </div>

        {/* Name + Matricule + Department */}
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-[#111827] truncate">
            {employee.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono text-[#6B7280]">
              {employee.matricule}
            </span>
            <span className="px-2 py-0.5 bg-warm-gray-300 text-[#374151] text-[11px] rounded-md">
              {employee.department}
            </span>
          </div>
        </div>

        {/* Days used + Progress bar */}
        <div className="flex-shrink-0">
          <div className="text-xs text-[#6B7280] mb-1">
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

        {/* Action buttons (hidden by default, appear on hover with delay) */}
        <div className="flex items-center gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 delay-100 group-hover:delay-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDetailsClick?.()
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-navy border border-navy/20 hover:bg-navy hover:text-white hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Détails
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDayOffClick?.()
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-navy text-white hover:bg-navy-dark hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            + Congé
          </button>
        </div>
      </div>
    </div>
  )
}

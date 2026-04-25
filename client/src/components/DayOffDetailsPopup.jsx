import { X, Calendar as CalendarIcon, Tag, MessageSquare, Paperclip } from 'lucide-react'
import { format, differenceInDays, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function DayOffDetailsPopup({ dayOff, position, onClose }) {
  if (!dayOff) return null

  // Calculate working days and calendar days
  const start = new Date(dayOff.startDate)
  const end = new Date(dayOff.endDate)
  const allDays = eachDayOfInterval({ start, end })
  const workingDays = allDays.filter(d => {
    const day = d.getDay()
    return day !== 5 && day !== 6 // Not Friday or Saturday
  }).length
  const calendarDays = differenceInDays(end, start) + 1

  // Format dates
  const startFormatted = format(start, 'd MMM', { locale: fr })
  const endFormatted = format(end, 'd MMM yyyy', { locale: fr })

  // Position popup near click, but keep on screen
  const popupStyle = {
    position: 'fixed',
    left: Math.min(position.x + 10, window.innerWidth - 300),
    top: Math.min(position.y + 10, window.innerHeight - 250),
    zIndex: 50,
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className="bg-white rounded-2xl p-4"
        style={{
          ...popupStyle,
          width: '280px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.16)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[11px] uppercase text-gray-500 font-semibold tracking-wide">Congé</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Duration */}
        <div className="flex items-start gap-2 mb-3">
          <CalendarIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {startFormatted} → {endFormatted}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {workingDays} jours ouvrables · {calendarDays} jours calendaires
            </div>
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-700">{dayOff.type || 'Congé annuel'}</span>
        </div>

        {/* Reason (optional) */}
        {dayOff.reason && (
          <div className="flex items-start gap-2 mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-[13px] text-gray-600 leading-relaxed">{dayOff.reason}</span>
          </div>
        )}

        {/* File (optional) */}
        <div className="flex items-start gap-2">
          <Paperclip className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {dayOff.justification ? (
              <>
                <div className="text-xs text-gray-600 truncate" title={dayOff.justification}>
                  {dayOff.justification.split('/').pop()?.slice(0, 24)}
                  {dayOff.justification.split('/').pop()?.length > 24 && '...'}
                </div>
                <a
                  href={`http://localhost:3001${dayOff.justification}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Voir le fichier
                </a>
              </>
            ) : (
              <span className="text-xs text-gray-400">Aucun justificatif</span>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

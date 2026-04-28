import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Loader2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDaysOff } from '../hooks/useDaysOff'
import { useTheme } from '../contexts/ThemeContext'

export default function CalendarPage() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026
  const [selectedDate, setSelectedDate] = useState(null)
  const { daysOff, loading, error, refetch } = useDaysOff()

  // Transform API data to calendar format
  const transformedDaysOff = daysOff.flatMap((dayOff) => {
    const dates = []
    const start = new Date(dayOff.startDate)
    const end = new Date(dayOff.endDate)

    // Generate all dates in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push({
        id: `${dayOff.id}-${d.toISOString().split('T')[0]}`,
        employeeId: dayOff.employeeId,
        employeeName: dayOff.employee?.name || 'Unknown',
        date: d.toISOString().split('T')[0],
        avatar: dayOff.employee?.avatar || '??',
      })
    }
    return dates
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get calendar days for current month
  const getCalendarDays = () => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    // We want Monday to be first, so adjust
    let firstDayOfWeek = firstDay.getDay()
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const days = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6 // Friday or Saturday
      const dayOffs = transformedDaysOff.filter(d => d.date === dateString)

      days.push({
        day,
        date: dateString,
        isWeekend,
        dayOffs,
        isToday: dateString === new Date().toISOString().split('T')[0],
      })
    }

    return days
  }

  const days = getCalendarDays()

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const monthName = currentDate.toLocaleDateString('fr-DZ', { month: 'long', year: 'numeric' })

  // Get day-offs for selected date
  const selectedDayOffs = selectedDate
    ? transformedDaysOff.filter(d => d.date === selectedDate)
    : []

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
      <div
        className="bg-apple-red/10 border border-apple-red/20 rounded-2xl p-6"
        style={isDark ? {
          backgroundColor: 'rgba(192,57,43,0.15)',
          borderColor: 'rgba(255,59,48,0.2)'
        } : {}}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-apple-red dark:text-[#FF6B6B]" />
          <div>
            <div className="font-semibold text-apple-red dark:text-[#FF6B6B]">Erreur de chargement</div>
            <p className="text-sm text-gray-700 dark:text-[#7A9CC4] mt-1">{error}</p>
            <button
              onClick={refetch}
              className="text-sm text-navy dark:text-[#639DFF] hover:underline mt-2"
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-[#E8EFF8]">
            {t('calendrierDesConges')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#7A9CC4] mt-1">
            {t('vueCalendrierTous')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors"
            style={isDark ? {
              backgroundColor: 'transparent'
            } : {}}
            onMouseEnter={(e) => {
              if (isDark) {
                e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (isDark) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Filter className="w-5 h-5 text-gray-600 dark:text-[#7A9CC4]" />
          </button>
        </div>
      </div>

      {/* Calendar card */}
      <div
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-ambient p-6"
        style={isDark ? {
          backgroundColor: '#0B1120',
          border: '1px solid rgba(99,157,255,0.12)',
          boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 8px 24px rgba(0,0,0,0.5)'
        } : {}}
      >
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg hover:bg-warm-gray-200 dark:hover:bg-white/[0.06] transition-colors"
            style={isDark ? {
              backgroundColor: 'transparent'
            } : {}}
            onMouseEnter={(e) => {
              if (isDark) {
                e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (isDark) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-[#7A9CC4]" />
          </button>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-navy dark:text-[#639DFF]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#E8EFF8] capitalize">
              {monthName}
            </h2>
          </div>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-warm-gray-200 dark:hover:bg-white/[0.06] transition-colors"
            style={isDark ? {
              backgroundColor: 'transparent'
            } : {}}
            onMouseEnter={(e) => {
              if (isDark) {
                e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
              }
            }}
            onMouseLeave={(e) => {
              if (isDark) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-[#7A9CC4]" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
              <div
                key={i}
                className={`text-center text-xs font-semibold ${
                  i >= 4 && i <= 5 ? 'text-gray-500 dark:text-[#4A6A8A]' : 'text-gray-700 dark:text-[#7A9CC4]'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => (
              <div
                key={i}
                onClick={() => day && setSelectedDate(day.date)}
                className={`aspect-square rounded-xl transition-all cursor-pointer ${
                  !day
                    ? 'pointer-events-none'
                    : day.isWeekend
                    ? 'bg-warm-gray-200 dark:bg-white/[0.04]'
                    : 'bg-warm-gray-200/50 dark:bg-white/[0.06] hover:bg-warm-gray-300 dark:hover:bg-white/[0.08]'
                } ${
                  day?.isToday
                    ? 'ring-2 ring-navy dark:ring-[#639DFF] ring-offset-2 dark:ring-offset-[#080C14]'
                    : ''
                } ${
                  day?.date === selectedDate
                    ? 'bg-navy/10 dark:bg-[rgba(99,157,255,0.12)] ring-2 ring-navy/20 dark:ring-[rgba(99,157,255,0.3)]'
                    : ''
                }`}
                style={isDark && day ? (
                  day.isWeekend
                    ? {
                        backgroundColor: 'rgba(99,157,255,0.03)'
                      }
                    : {
                        backgroundColor: 'rgba(99,157,255,0.06)'
                      }
                ) : {}}
                onMouseEnter={(e) => {
                  if (isDark && day && !day.isWeekend) {
                    e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (isDark && day && !day.isWeekend) {
                    e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.06)'
                  }
                }}
              >
                {day && (
                  <div className="h-full p-2 flex flex-col">
                    {/* Day number */}
                    <div
                      className={`text-sm font-semibold mb-1 ${
                        day.isToday
                          ? 'text-navy dark:text-[#639DFF]'
                          : day.isWeekend
                          ? 'text-gray-500 dark:text-[#4A6A8A]'
                          : 'text-gray-900 dark:text-[#E8EFF8]'
                      }`}
                    >
                      {day.day}
                    </div>

                    {/* Day-off indicators */}
                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                      {day.dayOffs.slice(0, 3).map((dayOff, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-navy/80 dark:bg-[rgba(99,157,255,0.3)] rounded text-white text-[9px] font-medium truncate"
                          title={dayOff.employeeName}
                        >
                          <div
                            className="w-3 h-3 rounded-full bg-white/20 dark:bg-white/30 flex items-center justify-center text-[7px] flex-shrink-0"
                          >
                            {dayOff.avatar[0]}
                          </div>
                          <span className="truncate">{dayOff.employeeName.split(' ')[0]}</span>
                        </div>
                      ))}
                      {day.dayOffs.length > 3 && (
                        <div className="text-[9px] text-gray-600 dark:text-[#7A9CC4] font-medium px-1.5">
                          +{day.dayOffs.length - 3} autre{day.dayOffs.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-6 mt-6 pt-6 border-t border-warm-gray-400"
          style={isDark ? {
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded bg-navy/80 dark:bg-[rgba(99,157,255,0.3)]"
            />
            <span className="text-xs text-gray-700 dark:text-[#7A9CC4]">Congé</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded bg-warm-gray-200 border-2 border-navy dark:border-[#639DFF]"
              style={isDark ? {
                backgroundColor: 'rgba(99,157,255,0.06)'
              } : {}}
            />
            <span className="text-xs text-gray-700 dark:text-[#7A9CC4]">{t('aujourdhui')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded bg-warm-gray-200"
              style={isDark ? {
                backgroundColor: 'rgba(99,157,255,0.03)'
              } : {}}
            />
            <span className="text-xs text-gray-700 dark:text-[#7A9CC4]">Weekend</span>
          </div>
        </div>
      </div>

      {/* Selected day details */}
      {selectedDate && selectedDayOffs.length > 0 && (
        <div
          className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-ambient p-6"
          style={isDark ? {
            backgroundColor: '#0B1120',
            border: '1px solid rgba(99,157,255,0.12)',
            boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 8px 24px rgba(0,0,0,0.5)'
          } : {}}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#E8EFF8] mb-4">
            Congés du{' '}
            {new Date(selectedDate).toLocaleDateString('fr-DZ', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <div className="space-y-3">
            {selectedDayOffs.map((dayOff) => (
              <div
                key={dayOff.id}
                className="flex items-center gap-3 p-3 bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.06)'
                } : {}}
              >
                <div
                  className="w-10 h-10 rounded-full bg-warm-gray-400 dark:bg-white/[0.08] flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-[#7A9CC4]"
                  style={isDark ? {
                    backgroundColor: 'rgba(99,157,255,0.15)'
                  } : {}}
                >
                  {dayOff.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-[#E8EFF8]">
                    {dayOff.employeeName}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-[#7A9CC4]">En congé</div>
                </div>
                <button className="text-xs font-medium text-navy dark:text-[#639DFF] hover:text-navy/80 dark:hover:text-[#639DFF]/80 transition-colors px-3 py-1.5">
                  Détails
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats summary */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div
          className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient"
          style={isDark ? {
            backgroundColor: '#0B1120',
            border: '1px solid rgba(99,157,255,0.12)',
            boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 8px 24px rgba(0,0,0,0.5)'
          } : {}}
        >
          <div className="text-2xl font-bold text-navy dark:text-[#639DFF]">
            {transformedDaysOff.filter(d => d.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-[#7A9CC4] mt-1">{t('congesCeMois')}</div>
        </div>
        <div
          className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient"
          style={isDark ? {
            backgroundColor: '#0B1120',
            border: '1px solid rgba(99,157,255,0.12)',
            boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 8px 24px rgba(0,0,0,0.5)'
          } : {}}
        >
          <div className="text-2xl font-bold text-navy dark:text-[#639DFF]">
            {new Set(transformedDaysOff.map(d => d.employeeId)).size}
          </div>
          <div className="text-sm text-gray-600 dark:text-[#7A9CC4] mt-1">{t('employesEnConge')}</div>
        </div>
        <div
          className="bg-white/80 backdrop-blur-xl rounded-xl p-4 shadow-ambient"
          style={isDark ? {
            backgroundColor: '#0B1120',
            border: '1px solid rgba(99,157,255,0.12)',
            boxShadow: '0 0 0 1px rgba(99,157,255,0.08), 0 8px 24px rgba(0,0,0,0.5)'
          } : {}}
        >
          <div className="text-2xl font-bold text-navy dark:text-[#639DFF]">
            {transformedDaysOff.length > 0
              ? Math.round((transformedDaysOff.filter(d => d.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length / 30) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600 dark:text-[#7A9CC4] mt-1">{t('tauxUtilisation')}</div>
        </div>
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { format, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CalendarGrid from './CalendarGrid'

export default function SplitCalendar({
  currentPeriod,
  selectedDates = new Set(),
  onDayClick,
  onDayOffClick,
  onNavigate,
  isDark,
  dayOffDates = new Set(),
  showNavigation = false,
  renderCellContent,
}) {
  const { t } = useTranslation()
  const { currentMonthDays, nextMonthDays, currentMonthLabel, nextMonthLabel } = useMemo(() => {
    const currentYear = currentPeriod.getFullYear()
    const currentMonth = currentPeriod.getMonth()

    // Next month calculation
    const nextMonth = currentMonth + 1
    const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear
    const normalizedNextMonth = nextMonth > 11 ? 0 : nextMonth

    // Generate days for current month (20-30)
    const daysInCurrentMonth = endOfMonth(new Date(currentYear, currentMonth)).getDate()
    const currentDays = []
    for (let d = 20; d <= daysInCurrentMonth; d++) {
      currentDays.push(new Date(currentYear, currentMonth, d))
    }

    // Pad with null for grid alignment (Monday = 1, Sunday = 0)
    const firstDayOfWeek = currentDays[0].getDay()
    const currentDaysToAdd = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    for (let i = 0; i < currentDaysToAdd; i++) {
      currentDays.unshift(null)
    }

    // Generate days for next month (1-19)
    const nextDays = []
    for (let d = 1; d <= 19; d++) {
      nextDays.push(new Date(nextYear, normalizedNextMonth, d))
    }

    // Pad with null for grid alignment
    const nextFirstDayOfWeek = nextDays[0].getDay()
    const nextDaysToAdd = nextFirstDayOfWeek === 0 ? 6 : nextFirstDayOfWeek - 1
    for (let i = 0; i < nextDaysToAdd; i++) {
      nextDays.unshift(null)
    }

    return {
      currentMonthDays: currentDays,
      nextMonthDays: nextDays,
      currentMonthLabel: format(new Date(currentYear, currentMonth), 'MMMM', { locale: fr }),
      nextMonthLabel: format(new Date(nextYear, normalizedNextMonth), 'MMMM', { locale: fr }),
    }
  }, [currentPeriod])

  return (
    <div
      className="rounded-xl p-4 bg-white dark:bg-[#1C1C28]"
      style={isDark ? {
        background: 'rgba(255,255,255,0.02)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
      } : {
        background: '#FAFAFA',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
      }}
    >
      {/* Navigation header */}
      {showNavigation && onNavigate && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate('prev')}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/[0.04] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6B7280] dark:text-[#8E8E93]" />
          </button>
          <div className="text-sm font-medium text-[#111827] dark:text-[#F2F2F7]">
            {t('periodeTravail')}
          </div>
          <button
            onClick={() => onNavigate('next')}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/[0.04] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#6B7280] dark:text-[#8E8E93]" />
          </button>
        </div>
      )}

      {/* First half (20-30) */}
      <div className="mb-4">
        <CalendarGrid
          days={currentMonthDays}
          monthLabel={currentMonthLabel}
          selectedDates={selectedDates}
          onDayClick={onDayClick}
          onDayOffClick={onDayOffClick}
          isDark={isDark}
          dayOffDates={dayOffDates}
          renderCellContent={renderCellContent}
        />
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-gray-100 dark:bg-white/[0.06] my-3" />

      {/* Second half (1-19) */}
      <div className="mt-2">
        <CalendarGrid
          days={nextMonthDays}
          monthLabel={nextMonthLabel}
          selectedDates={selectedDates}
          onDayClick={onDayClick}
          onDayOffClick={onDayOffClick}
          isDark={isDark}
          dayOffDates={dayOffDates}
          renderCellContent={renderCellContent}
        />
      </div>
    </div>
  )
}

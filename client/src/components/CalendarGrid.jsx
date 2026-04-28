export default function CalendarGrid({
  days,
  monthLabel,
  selectedDates = new Set(),
  onDayClick,
  onDayOffClick,
  isDark,
  dayOffDates = new Set(),
  renderCellContent,
  renderCell,
}) {
  const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div>
      {/* Month label */}
      <div className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-[#7A9CC4] mb-2 ml-1">
        {monthLabel}
      </div>

      {/* Day name header */}
      <div
        className="grid grid-cols-7 gap-0.5 pb-1 mb-1"
        style={{
          borderBottom: isDark ? '0.5px solid rgba(99,157,255,0.15)' : '0.5px solid #E5E5EA'
        }}
      >
        {dayNames.map((day, i) => (
          <div
            key={i}
            className="text-[10px] font-medium text-center py-1"
            style={{ color: i >= 5 ? (isDark ? '#4A6A8A' : '#C7C7CC') : (isDark ? '#7A9CC4' : '#8E8E93') }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date, i) => {
          if (date === null) {
            // Empty padding cell
            return <div key={`empty-${i}`} className="w-9 h-9" />
          }

          // If custom cell renderer provided, use it
          if (renderCell) {
            return renderCell(date, i, { isDark })
          }

          // Default rendering
          const dayNum = date.getDate()
          const timestamp = date.getTime()
          const isSelected = selectedDates.has(timestamp)
          const isDayOff = dayOffDates.has(timestamp)
          const isWeekend = date.getDay() === 5 || date.getDay() === 6 // Friday = 5, Saturday = 6
          const isToday = date.toDateString() === new Date().toDateString()

          const handleClick = (e) => {
            if (isDayOff && onDayOffClick) {
              onDayOffClick(date, e)
            } else if (onDayClick) {
              onDayClick(date, e)
            }
          }

          const Element = (isDayOff && onDayOffClick) || onDayClick ? 'button' : 'div'

          return (
            <Element
              key={i}
              onClick={Element === 'button' ? handleClick : undefined}
              disabled={isWeekend && Element === 'button'}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-medium transition-all duration-150 ${
                isDayOff
                  ? 'cursor-pointer hover:opacity-90'
                  : isWeekend
                    ? 'cursor-not-allowed'
                    : isSelected
                      ? 'cursor-pointer'
                      : onDayClick
                        ? 'cursor-pointer hover:opacity-80'
                        : ''
              }`}
              style={{
                background: isDayOff
                  ? 'linear-gradient(135deg, rgba(255,59,48,0.15), rgba(192,57,43,0.1))'
                  : isWeekend
                    ? (isDark ? 'rgba(99,157,255,0.03)' : '#F2F2F7')
                    : isSelected
                      ? (isDark ? 'linear-gradient(135deg, rgba(99,157,255,0.15), rgba(99,157,255,0.1))' : 'linear-gradient(135deg, rgba(0,122,255,0.12), rgba(0,122,255,0.08))')
                      : isToday
                        ? (isDark ? 'linear-gradient(145deg, rgba(99,157,255,0.12), rgba(99,157,255,0.06))' : 'linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))')
                        : (isDark ? 'rgba(99,157,255,0.05)' : '#FAFAFA'),
                boxShadow: isDayOff
                  ? 'inset 0 1px 2px rgba(0,0,0,0.1)'
                  : isWeekend
                    ? (isDark ? 'inset 0 1px 2px rgba(0,0,0,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.04)')
                    : isSelected
                      ? (isDark ? '0 0 0 2px #639DFF' : '0 0 0 2px #007AFF')
                      : isToday
                        ? (isDark ? '0 0 0 1.5px #639DFF' : '0 0 0 1.5px #007AFF')
                        : (isDark ? 'inset 0 1px 1px rgba(255,255,255,0.04), 0 0 0 1px rgba(99,157,255,0.08)' : 'inset 0 1px 1px rgba(255,255,255,0.9)'),
                border: isDayOff || isWeekend || isToday || isSelected ? 'none' : (isDark ? '1px solid rgba(99,157,255,0.08)' : '1px solid rgba(0,0,0,0.04)'),
                color: isDayOff
                  ? '#C0392B'
                  : isWeekend
                    ? (isDark ? '#4A6A8A' : '#C7C7CC')
                    : isSelected
                      ? (isDark ? '#639DFF' : '#007AFF')
                      : isToday
                        ? (isDark ? '#639DFF' : '#007AFF')
                        : (isDark ? '#7A9CC4' : '#374151'),
                fontWeight: isDayOff || isSelected || isToday ? 600 : 'inherit',
              }}
            >
              {renderCellContent ? renderCellContent(date, { isSelected, isDayOff, isWeekend, isToday }) : dayNum}
            </Element>
          )
        })}
      </div>
    </div>
  )
}

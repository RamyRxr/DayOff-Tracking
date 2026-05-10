/**
 * Period calculation utilities for DayOff tracking
 * Work period: 20th of current month → 19th of next month
 */

/**
 * Calculate the work period for a given date with optional month offset
 */
export function calculateWorkPeriod(baseDate = new Date(), monthOffset = 0) {
  const targetDate = new Date(baseDate)
  targetDate.setMonth(targetDate.getMonth() + monthOffset)

  const year = targetDate.getFullYear()
  const month = targetDate.getMonth()
  const day = targetDate.getDate()

  let periodYear, periodMonth
  if (day >= 20) {
    periodYear = year
    periodMonth = month
  } else {
    const prevDate = new Date(year, month - 1, 1)
    periodYear = prevDate.getFullYear()
    periodMonth = prevDate.getMonth()
  }

  return { year: periodYear, month: periodMonth }
}

/**
 * Get start and end dates for a given period (year, month)
 */
export function getPeriodDateRange(year, month) {
  const startDate = new Date(year, month, 20, 0, 0, 0, 0)
  const endDate = new Date(year, month + 1, 19, 23, 59, 59, 999)
  return { startDate, endDate }
}

/**
 * Get period label for display (e.g., "Décembre 2024 → Janvier 2025")
 */
export function getPeriodLabel(year, month, locale = 'fr') {
  const startDate = new Date(year, month, 20)
  const endDate = new Date(year, month + 1, 19)

  const startMonthName = startDate.toLocaleDateString(locale, { month: 'long' })
  const endMonthName = endDate.toLocaleDateString(locale, { month: 'long' })
  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()

  return `${startMonthName} ${startYear} → ${endMonthName} ${endYear}`
}

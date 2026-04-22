/**
 * Period utility functions for NAFTAL work period calculations
 * Period: 20th of month → 19th of next month
 * Weekends: Friday + Saturday (Algeria)
 */

/**
 * Check if a date falls on a weekend (Friday or Saturday)
 * @param {Date} date
 * @returns {boolean}
 */
export function isWeekend(date) {
  const day = date.getDay()
  return day === 5 || day === 6 // Friday = 5, Saturday = 6
}

/**
 * Get the current work period dates
 * @param {Date} referenceDate - Optional reference date (defaults to today)
 * @returns {{ start: Date, end: Date }}
 */
export function getCurrentPeriod(referenceDate = new Date()) {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const day = referenceDate.getDate()

  let start, end

  if (day >= 20) {
    // Period: 20th of current month → 19th of next month
    start = new Date(year, month, 20)
    end = new Date(year, month + 1, 19)
  } else {
    // Period: 20th of previous month → 19th of current month
    start = new Date(year, month - 1, 20)
    end = new Date(year, month, 19)
  }

  // Set time to start/end of day
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Count working days between two dates (excluding weekends)
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
export function countWorkingDays(startDate, endDate) {
  let count = 0
  const current = new Date(startDate)

  while (current <= endDate) {
    if (!isWeekend(current)) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }

  return count
}

/**
 * Count total calendar days between two dates (inclusive)
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number}
 */
export function countCalendarDays(startDate, endDate) {
  const diffTime = Math.abs(endDate - startDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // +1 to include both start and end dates
}

/**
 * Detect sandwich pattern (weekends bridged by day-off)
 * Returns true if calendar days > working days (indicates weekend included)
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {boolean}
 */
export function detectSandwich(startDate, endDate) {
  const workingDays = countWorkingDays(startDate, endDate)
  const calendarDays = countCalendarDays(startDate, endDate)
  return calendarDays > workingDays
}

/**
 * Calculate block eligibility
 * Block triggers when (totalDays - daysUsed) < 16
 * @param {number} totalDays - Total annual days (usually 30)
 * @param {number} daysUsed - Days already used
 * @returns {boolean}
 */
export function shouldBlock(totalDays, daysUsed) {
  const daysRemaining = totalDays - daysUsed
  return daysRemaining < 16
}

/**
 * Format period for display
 * @param {Date} start
 * @param {Date} end
 * @param {string} locale - Default 'fr-DZ'
 * @returns {string}
 */
export function formatPeriod(start, end, locale = 'fr-DZ') {
  const startStr = start.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })
  const endStr = end.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return `${startStr} → ${endStr}`
}

/**
 * Get all working days in a period
 * @param {Date} start
 * @param {Date} end
 * @returns {Date[]}
 */
export function getWorkingDaysInPeriod(start, end) {
  const workingDays = []
  const current = new Date(start)

  while (current <= end) {
    if (!isWeekend(current)) {
      workingDays.push(new Date(current))
    }
    current.setDate(current.getDate() + 1)
  }

  return workingDays
}

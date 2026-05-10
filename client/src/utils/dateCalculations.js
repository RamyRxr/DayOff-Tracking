/**
 * Date calculation utilities for day-off tracking
 * Handles working days, calendar days, and sandwich detection
 */

/**
 * Check if a date is a weekend (Friday or Saturday in Algeria)
 */
export function isWeekend(date) {
  const day = date.getDay()
  return day === 5 || day === 6 // Friday = 5, Saturday = 6
}

/**
 * Count working days between two dates (excluding weekends)
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
 */
export function countCalendarDays(startDate, endDate) {
  const msPerDay = 24 * 60 * 60 * 1000
  const diffMs = endDate.getTime() - startDate.getTime()
  return Math.floor(diffMs / msPerDay) + 1
}

/**
 * Detect if there's a "sandwich" (weekend abuse)
 * Returns true if actual calendar days > declared working days
 */
export function detectSandwich(startDate, endDate, workingDayCount) {
  const calendarDays = countCalendarDays(startDate, endDate)
  return calendarDays > workingDayCount
}

/**
 * Calculate comprehensive day-off statistics
 */
export function calculateDayOffStats(startDate, endDate) {
  const workingDays = countWorkingDays(startDate, endDate)
  const calendarDays = countCalendarDays(startDate, endDate)
  const hasSandwich = detectSandwich(startDate, endDate, workingDays)

  return {
    workingDays,
    calendarDays,
    hasSandwich,
    totalDays: workingDays // Total days to deduct
  }
}

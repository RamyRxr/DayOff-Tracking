// Returns { start: Date, end: Date } for the current work period
// Work period = 20th of last month → 19th of current month
function getCurrentPeriod() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  let start, end
  if (day >= 20) {
    start = new Date(year, month, 20)
    end = new Date(year, month + 1, 19)
  } else {
    start = new Date(year, month - 1, 20)
    end = new Date(year, month, 19)
  }
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

// Returns true if a date is Friday (5) or Saturday (6)
// Algeria weekend = Friday + Saturday
function isWeekend(date) {
  const day = new Date(date).getDay()
  return day === 5 || day === 6
}

// Count working days between two dates (inclusive), excluding Fri + Sat
function countWorkingDays(startDate, endDate) {
  let count = 0
  const current = new Date(startDate)
  current.setHours(0, 0, 0, 0)
  const end = new Date(endDate)
  end.setHours(0, 0, 0, 0)
  while (current <= end) {
    if (!isWeekend(current)) count++
    current.setDate(current.getDate() + 1)
  }
  return count
}

// Count calendar days between two dates (inclusive)
function countCalendarDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
}

// Sandwich detection: true if the range spans a weekend
// meaning the employee declared fewer working days than calendar days consumed
function isSandwich(startDate, endDate) {
  const working = countWorkingDays(startDate, endDate)
  const calendar = countCalendarDays(startDate, endDate)
  return calendar > working
}

// Returns true if employee should be blocked
// Block when remaining working days would fall below 16
// (30 - daysUsed) < 16 means daysUsed > 14
function shouldBlock(daysUsed) {
  return (30 - daysUsed) < 16
}

// Count how many working days have elapsed since period start (up to today)
function workingDaysElapsed() {
  const { start } = getCurrentPeriod()
  const today = new Date()
  return countWorkingDays(start, today)
}

module.exports = {
  getCurrentPeriod,
  isWeekend,
  countWorkingDays,
  countCalendarDays,
  isSandwich,
  shouldBlock,
  workingDaysElapsed,
}

/**
 * Day-off API endpoints
 */
import fetchAPI from './client.js'

/**
 * Get all day-off records
 * @param {Object} filters - Optional filters (employeeId, periodStart, periodEnd)
 * @returns {Promise<{ data: DayOff[] }>}
 */
export async function getDaysOff(filters = {}) {
  const params = new URLSearchParams()

  if (filters.employeeId) params.append('employeeId', filters.employeeId)
  if (filters.periodStart) params.append('periodStart', filters.periodStart)
  if (filters.periodEnd) params.append('periodEnd', filters.periodEnd)

  const queryString = params.toString()
  const endpoint = queryString ? `/daysoff?${queryString}` : '/daysoff'

  return fetchAPI(endpoint)
}

/**
 * Create new day-off request
 * @param {Object} dayOffData - { employeeId, startDate, endDate, reason?, justification? }
 * @returns {Promise<{ data: { dayOff, stats, block } }>}
 */
export async function createDayOff(dayOffData) {
  return fetchAPI('/daysoff', {
    method: 'POST',
    body: JSON.stringify(dayOffData),
  })
}

/**
 * Employee API endpoints
 */
import fetchAPI from './client.js'

/**
 * Get all employees with period stats
 * @returns {Promise<{ data: Employee[] }>}
 */
export async function getEmployees() {
  return fetchAPI('/employees')
}

/**
 * Get single employee with full details
 * @param {number} id
 * @returns {Promise<{ data: Employee }>}
 */
export async function getEmployee(id) {
  return fetchAPI(`/employees/${id}`)
}

/**
 * Create new employee
 * @param {Object} employeeData
 * @returns {Promise<{ data: Employee }>}
 */
export async function createEmployee(employeeData) {
  return fetchAPI('/employees', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  })
}

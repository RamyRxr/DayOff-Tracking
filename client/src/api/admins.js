/**
 * Admin API endpoints
 */
import fetchAPI from './client.js'

/**
 * Get all admins
 * @returns {Promise<{ data: Admin[] }>}
 */
export async function getAdmins() {
  return fetchAPI('/admins')
}

/**
 * Verify admin PIN
 * @param {Object} credentials - { adminId, pin }
 * @returns {Promise<{ data: { id, name, email, role, verified } }>}
 */
export async function verifyAdminPin(credentials) {
  return fetchAPI('/admins/verify-pin', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

/**
 * Create new admin
 * @param {Object} adminData - { name, email, role, pin }
 * @returns {Promise<{ data: Admin }>}
 */
export async function createAdmin(adminData) {
  return fetchAPI('/admins', {
    method: 'POST',
    body: JSON.stringify(adminData),
  })
}

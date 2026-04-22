/**
 * Block API endpoints
 */
import fetchAPI from './client.js'

/**
 * Get all blocks (active by default)
 * @param {boolean} activeOnly
 * @returns {Promise<{ data: Block[] }>}
 */
export async function getBlocks(activeOnly = true) {
  const endpoint = activeOnly ? '/blocks' : '/blocks?active=false'
  return fetchAPI(endpoint)
}

/**
 * Block an employee
 * @param {Object} blockData - { employeeId, reason, adminId, pin }
 * @returns {Promise<{ data: Block }>}
 */
export async function blockEmployee(blockData) {
  return fetchAPI('/blocks', {
    method: 'POST',
    body: JSON.stringify(blockData),
  })
}

/**
 * Unblock an employee
 * @param {number} blockId
 * @param {Object} unblockData - { adminId, pin }
 * @returns {Promise<{ data: Block }>}
 */
export async function unblockEmployee(blockId, unblockData) {
  return fetchAPI(`/blocks/${blockId}/unblock`, {
    method: 'PATCH',
    body: JSON.stringify(unblockData),
  })
}

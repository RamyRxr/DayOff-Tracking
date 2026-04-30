/**
 * API Client for DayOff-Tracking
 * Base URL configuration and fetch wrapper
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

/**
 * Fetch wrapper with error handling
 * @param {string} endpoint
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    // Parse response
    const data = await response.json()

    // Handle errors
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message)
    throw error
  }
}

export default fetchAPI

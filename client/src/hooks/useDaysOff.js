import { useState, useEffect } from 'react'
import { getDaysOff, createDayOff } from '../api/daysoff'

/**
 * Hook to fetch and manage day-off records
 */
export function useDaysOff(filters = {}) {
  const [daysOff, setDaysOff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDaysOff = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getDaysOff(filters)
      setDaysOff(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDaysOff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.employeeId])

  const refetch = () => {
    fetchDaysOff()
  }

  const addDayOff = async (dayOffData) => {
    try {
      const response = await createDayOff(dayOffData)
      setDaysOff([response.data.dayOff, ...daysOff])
      return response.data
    } catch (err) {
      throw err
    }
  }

  return {
    daysOff,
    loading,
    error,
    refetch,
    addDayOff,
  }
}

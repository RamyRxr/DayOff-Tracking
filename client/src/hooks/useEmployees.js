import { useState, useEffect } from 'react'
import { getEmployees, getEmployee, createEmployee } from '../api/employees'

/**
 * Hook to fetch and manage employees list
 */
export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getEmployees()
      setEmployees(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const refetch = () => {
    fetchEmployees()
  }

  const addEmployee = async (employeeData) => {
    try {
      const response = await createEmployee(employeeData)
      setEmployees([...employees, response.data])
      return response.data
    } catch (err) {
      throw err
    }
  }

  return {
    employees,
    loading,
    error,
    refetch,
    addEmployee,
  }
}

/**
 * Hook to fetch single employee details
 */
export function useEmployee(id) {
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEmployee = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const response = await getEmployee(id)
      setEmployee(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployee()
  }, [id])

  const refetch = () => {
    fetchEmployee()
  }

  return {
    employee,
    loading,
    error,
    refetch,
  }
}

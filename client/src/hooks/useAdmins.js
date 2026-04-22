import { useState, useEffect } from 'react'
import { getAdmins, verifyAdminPin } from '../api/admins'

/**
 * Hook to fetch admins list
 */
export function useAdmins() {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAdmins()
      setAdmins(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  return {
    admins,
    loading,
    error,
  }
}

/**
 * Hook to verify admin PIN
 */
export function useAdminPin() {
  const [verifying, setVerifying] = useState(false)
  const [verifiedAdmin, setVerifiedAdmin] = useState(null)
  const [error, setError] = useState(null)

  const verify = async (adminId, pin) => {
    try {
      setVerifying(true)
      setError(null)
      const response = await verifyAdminPin({ adminId, pin })
      setVerifiedAdmin(response.data)
      return response.data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setVerifying(false)
    }
  }

  const reset = () => {
    setVerifiedAdmin(null)
    setError(null)
  }

  return {
    verify,
    verifying,
    verifiedAdmin,
    error,
    reset,
  }
}

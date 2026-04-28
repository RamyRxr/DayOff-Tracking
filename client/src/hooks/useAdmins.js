import { useState, useEffect, useCallback } from 'react'
import { getAdmins, verifyAdminPin } from '../api/admins'

/**
 * Hook to fetch admins list
 */
export function useAdmins() {
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const refetch = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getAdmins()
            setAdmins(Array.isArray(response?.data) ? response.data : [])
        } catch (err) {
            setError(err.message || 'Error loading administrators')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        async function loadAdmins() {
            try {
                const response = await getAdmins()
                if (cancelled) return
                setError(null)
                setAdmins(Array.isArray(response?.data) ? response.data : [])
            } catch (err) {
                if (cancelled) return
                setError(err.message || 'Error loading administrators')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadAdmins()

        return () => {
            cancelled = true
        }
    }, [])

    return {
        admins,
        loading,
        error,
        refetch,
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

            const response = await verifyAdminPin({
                adminId: String(adminId),
                pin: String(pin),
            })

            if (!response?.data?.valid) {
                throw new Error('Incorrect PIN code')
            }

            const data = {
                id: String(adminId),
                name: response.data.adminName,
                verified: true,
            }

            setVerifiedAdmin(data)
            return data
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

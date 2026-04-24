import { useState, useEffect } from 'react'

const ADMINS_KEY = 'dayoff-tracking:mock-admins:v1'
const UPDATE_EVENT = 'dayoff-mock-updated'

const DEFAULT_ADMINS = [
  {
    id: 1,
    name: 'Ahmed Benali',
    email: 'ahmed.benali@naftal.dz',
    role: 'Responsable RH',
    pin: '1234',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Fatima Meziane',
    email: 'fatima.meziane@naftal.dz',
    role: 'Directeur Admin',
    pin: '5678',
    createdAt: new Date().toISOString(),
  },
]

function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

function readAdminsRaw() {
  try {
    const raw = localStorage.getItem(ADMINS_KEY)
    if (!raw) {
      localStorage.setItem(ADMINS_KEY, JSON.stringify(DEFAULT_ADMINS))
      return clone(DEFAULT_ADMINS)
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return clone(DEFAULT_ADMINS)
    }

    return parsed
  } catch {
    return clone(DEFAULT_ADMINS)
  }
}

function publicAdmin(admin) {
  const { pin: _PIN, ...adminData } = admin
  return adminData
}

function readAdmins() {
  return readAdminsRaw().map(publicAdmin)
}

function emitDataChange() {
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

/**
 * Hook to fetch admins list
 */
export function useAdmins() {
  const [admins, setAdmins] = useState(() => readAdmins())
  const loading = false
  const error = null

  useEffect(() => {
    const syncAdmins = () => {
      setAdmins(readAdmins())
    }

    const onStorage = (event) => {
      if (event.key === ADMINS_KEY) {
        syncAdmins()
      }
    }

    window.addEventListener(UPDATE_EVENT, syncAdmins)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncAdmins)
      window.removeEventListener('storage', onStorage)
    }
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

      const admin = readAdminsRaw().find((item) => item.id === Number(adminId))
      if (!admin || admin.pin !== pin) {
        throw new Error('Code PIN incorrect')
      }

      const data = {
        ...publicAdmin(admin),
        verified: true,
      }
      setVerifiedAdmin(data)
      emitDataChange()
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

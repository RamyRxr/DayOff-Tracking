import { useState, useEffect } from 'react'

const BLOCKS_KEY = 'dayoff-tracking:mock-blocks:v1'
const EMPLOYEES_KEY = 'dayoff-tracking:mock-employees:v1'
const ADMINS_KEY = 'dayoff-tracking:mock-admins:v1'
const UPDATE_EVENT = 'dayoff-mock-updated'

const DEFAULT_ADMINS = [
  {
    id: 1,
    name: 'Ahmed Benali',
    email: 'ahmed.benali@naftal.dz',
    role: 'Responsable RH',
    pin: '1234',
  },
  {
    id: 2,
    name: 'Fatima Meziane',
    email: 'fatima.meziane@naftal.dz',
    role: 'Directeur Admin',
    pin: '5678',
  },
]

function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value))
}

function readList(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return clone(fallback)
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : clone(fallback)
  } catch {
    return clone(fallback)
  }
}

function writeList(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function emitDataChange() {
  window.dispatchEvent(new Event(UPDATE_EVENT))
}

function stripPin(admin) {
  const { pin: _PIN, ...adminData } = admin
  return adminData
}

function getBlocksSnapshot(activeOnly = true) {
  const blocks = readList(BLOCKS_KEY, [])
  const employees = readList(EMPLOYEES_KEY, [])
  const admins = readList(ADMINS_KEY, DEFAULT_ADMINS)

  const filtered = activeOnly ? blocks.filter((item) => item.isActive) : blocks

  return filtered
    .map((block) => {
      const employee = employees.find((item) => item.id === block.employeeId) || null
      const blockedBy = admins.find((item) => item.id === block.blockedById) || null
      const unblockedBy = block.unblockedById
        ? admins.find((item) => item.id === block.unblockedById)
        : null

      return {
        ...block,
        employee,
        blockedBy: blockedBy ? stripPin(blockedBy) : null,
        unblockedBy: unblockedBy ? stripPin(unblockedBy) : null,
      }
    })
    .sort((a, b) => new Date(b.blockedAt || 0) - new Date(a.blockedAt || 0))
}

/**
 * Hook to fetch and manage blocks
 */
export function useBlocks(activeOnly = true) {
  const [blocks, setBlocks] = useState(() => getBlocksSnapshot(activeOnly))
  const loading = false
  const [error, setError] = useState(null)

  useEffect(() => {
    const syncBlocks = () => {
      setBlocks(getBlocksSnapshot(activeOnly))
    }

    const onStorage = (event) => {
      if (event.key === BLOCKS_KEY || event.key === EMPLOYEES_KEY || event.key === ADMINS_KEY) {
        syncBlocks()
      }
    }

    window.addEventListener(UPDATE_EVENT, syncBlocks)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncBlocks)
      window.removeEventListener('storage', onStorage)
    }
  }, [activeOnly])

  const refetch = () => {
    setBlocks(getBlocksSnapshot(activeOnly))
  }

  const block = async (blockData) => {
    try {
      setError(null)

      const blocksList = readList(BLOCKS_KEY, [])
      const employeeId = Number(blockData?.employeeId)

      if (!employeeId || !blockData?.reason) {
        throw new Error('Champs requis manquants pour le blocage')
      }

      const alreadyBlocked = blocksList.some(
        (item) => item.employeeId === employeeId && item.isActive
      )
      if (alreadyBlocked) {
        throw new Error('Cet employé est déjà bloqué')
      }

      const nextId = blocksList.length ? Math.max(...blocksList.map((item) => item.id)) + 1 : 1
      const created = {
        id: nextId,
        employeeId,
        reason: blockData.reason,
        description: blockData.description || null,
        daysUsed: blockData.daysUsed || 0,
        daysRemaining: blockData.daysRemaining || 0,
        blockedById: Number(blockData.adminId) || 1,
        blockedAt: new Date().toISOString(),
        unblockedById: null,
        unblockedAt: null,
        isActive: true,
      }

      writeList(BLOCKS_KEY, [created, ...blocksList])
      setBlocks(getBlocksSnapshot(activeOnly))
      emitDataChange()

      const createdView = getBlocksSnapshot(false).find((item) => item.id === nextId)
      if (!createdView) {
        throw new Error('Échec de création du blocage')
      }

      return createdView
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const unblock = async (blockId, unblockData) => {
    try {
      setError(null)

      const blocksList = readList(BLOCKS_KEY, [])
      const targetId = Number(blockId)

      const updatedList = blocksList.map((item) => {
        if (item.id !== targetId) {
          return item
        }

        return {
          ...item,
          isActive: false,
          unblockedAt: new Date().toISOString(),
          unblockedById: Number(unblockData?.adminId) || 1,
          unblockReason: unblockData?.reason || null,
          unblockDescription: unblockData?.description || null,
        }
      })

      const targetBlock = updatedList.find((item) => item.id === targetId)
      if (!targetBlock) {
        throw new Error('Blocage introuvable')
      }

      writeList(BLOCKS_KEY, updatedList)
      setBlocks(getBlocksSnapshot(activeOnly))
      emitDataChange()

      const updated = getBlocksSnapshot(false).find((item) => item.id === targetId)
      if (!updated) {
        throw new Error('Échec du déblocage')
      }

      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    blocks,
    loading,
    error,
    refetch,
    block,
    unblock,
  }
}

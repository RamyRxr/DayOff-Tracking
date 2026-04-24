import { useState, useEffect } from 'react'

const DAYSOFF_KEY = 'dayoff-tracking:mock-daysoff:v1'
const BLOCKS_KEY = 'dayoff-tracking:mock-blocks:v1'
const EMPLOYEES_KEY = 'dayoff-tracking:mock-employees:v1'
const UPDATE_EVENT = 'dayoff-mock-updated'

const DEFAULT_DAYSOFF = [
  {
    id: 1,
    employeeId: 1,
    startDate: '2026-04-02',
    endDate: '2026-04-04',
    workingDays: 2,
    calendarDays: 3,
    isSandwich: true,
    reason: 'Congé familial',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    employeeId: 2,
    startDate: '2026-04-10',
    endDate: '2026-04-15',
    workingDays: 4,
    calendarDays: 6,
    isSandwich: true,
    reason: 'Maladie',
    createdAt: new Date().toISOString(),
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

function countWorkingDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let total = 0
  const cursor = new Date(start)

  while (cursor <= end) {
    const day = cursor.getDay()
    if (day !== 5 && day !== 6) {
      total++
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return total
}

function currentPeriod() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  if (now.getDate() >= 20) {
    return {
      start: new Date(year, month, 20),
      end: new Date(year, month + 1, 19),
    }
  }

  return {
    start: new Date(year, month - 1, 20),
    end: new Date(year, month, 19),
  }
}

function getDaysOffSnapshot(filters = {}) {
  let records = readList(DAYSOFF_KEY, DEFAULT_DAYSOFF)

  if (filters.employeeId) {
    records = records.filter((item) => item.employeeId === Number(filters.employeeId))
  }
  if (filters.periodStart) {
    const periodStart = new Date(filters.periodStart)
    records = records.filter((item) => new Date(item.startDate) >= periodStart)
  }
  if (filters.periodEnd) {
    const periodEnd = new Date(filters.periodEnd)
    records = records.filter((item) => new Date(item.endDate) <= periodEnd)
  }

  return records.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
}

/**
 * Hook to fetch and manage day-off records
 */
export function useDaysOff(filters = {}) {
  const [daysOff, setDaysOff] = useState(() => getDaysOffSnapshot(filters))
  const loading = false
  const [error, setError] = useState(null)

  useEffect(() => {
    const syncDaysOff = () => {
      setDaysOff(getDaysOffSnapshot(filters))
    }

    const onStorage = (event) => {
      if (event.key === DAYSOFF_KEY) {
        syncDaysOff()
      }
    }

    window.addEventListener(UPDATE_EVENT, syncDaysOff)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncDaysOff)
      window.removeEventListener('storage', onStorage)
    }
  }, [filters.employeeId, filters.periodStart, filters.periodEnd])

  const refetch = () => {
    setDaysOff(getDaysOffSnapshot(filters))
  }

  const addDayOff = async (dayOffData) => {
    try {
      setError(null)

      const employeeId = Number(dayOffData?.employeeId)
      if (!employeeId || !dayOffData?.startDate || !dayOffData?.endDate) {
        throw new Error('Champs requis manquants pour le congé')
      }

      const employees = readList(EMPLOYEES_KEY, [])
      const employee = employees.find((item) => item.id === employeeId)
      if (!employee) {
        throw new Error('Employé introuvable')
      }

      const currentDaysOff = readList(DAYSOFF_KEY, DEFAULT_DAYSOFF)
      const nextId = currentDaysOff.length
        ? Math.max(...currentDaysOff.map((item) => item.id)) + 1
        : 1

      const workingDays = countWorkingDays(dayOffData.startDate, dayOffData.endDate)
      const calendarDays =
        Math.floor(
          (new Date(dayOffData.endDate) - new Date(dayOffData.startDate)) /
          (1000 * 60 * 60 * 24)
        ) + 1

      const dayOff = {
        id: nextId,
        employeeId,
        startDate: dayOffData.startDate,
        endDate: dayOffData.endDate,
        workingDays,
        calendarDays,
        isSandwich: calendarDays > workingDays,
        reason: dayOffData.reason || null,
        justification: dayOffData.justification || null,
        createdAt: new Date().toISOString(),
      }

      const nextDaysOff = [dayOff, ...currentDaysOff]
      writeList(DAYSOFF_KEY, nextDaysOff)

      const period = currentPeriod()
      const usedInPeriod = nextDaysOff
        .filter((item) => {
          if (item.employeeId !== employeeId) return false
          const startDate = new Date(item.startDate)
          return startDate >= period.start && startDate <= period.end
        })
        .reduce((total, item) => total + (item.workingDays || 0), 0)

      const daysRemaining = (employee.daysTotal || 30) - usedInPeriod
      const blocks = readList(BLOCKS_KEY, [])
      const activeBlock = blocks.find((item) => item.employeeId === employeeId && item.isActive)

      let block = null
      if (!activeBlock && daysRemaining < 16) {
        const nextBlockId = blocks.length ? Math.max(...blocks.map((item) => item.id)) + 1 : 1
        block = {
          id: nextBlockId,
          employeeId,
          reason: 'Blocage automatique: minimum de 16 jours ouvrables non respecté',
          daysUsed: usedInPeriod,
          daysRemaining,
          blockedById: 1,
          blockedAt: new Date().toISOString(),
          isActive: true,
        }

        writeList(BLOCKS_KEY, [block, ...blocks])
      }

      const result = {
        dayOff,
        stats: {
          daysUsed: usedInPeriod,
          daysRemaining,
        },
        block,
      }

      setDaysOff(getDaysOffSnapshot(filters))
      emitDataChange()
      return result
    } catch (err) {
      setError(err.message)
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

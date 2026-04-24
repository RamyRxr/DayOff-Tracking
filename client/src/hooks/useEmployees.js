import { useState, useEffect } from 'react'

const EMPLOYEES_KEY = 'dayoff-tracking:mock-employees:v1'
const DAYSOFF_KEY = 'dayoff-tracking:mock-daysoff:v1'
const BLOCKS_KEY = 'dayoff-tracking:mock-blocks:v1'
const UPDATE_EVENT = 'dayoff-mock-updated'

const DEFAULT_EMPLOYEES = [
  {
    id: 1,
    matricule: 'NAF-4102',
    name: 'Yacine Khelifi',
    department: 'Production',
    position: 'Technicien',
    avatar: 'YK',
    email: 'yacine.khelifi@naftal.dz',
    phone: '+213 551 23 45 67',
    startDate: '2024-01-10',
    createdAt: new Date().toISOString(),
    daysTotal: 30,
  },
  {
    id: 2,
    matricule: 'NAF-7821',
    name: 'Samira Boudiaf',
    department: 'Logistique',
    position: 'Cheffe d\'équipe',
    avatar: 'SB',
    email: 'samira.boudiaf@naftal.dz',
    phone: '+213 661 10 22 33',
    startDate: '2023-09-03',
    createdAt: new Date().toISOString(),
    daysTotal: 30,
  },
  {
    id: 3,
    matricule: 'NAF-3350',
    name: 'Karim Touati',
    department: 'Maintenance',
    position: 'Superviseur',
    avatar: 'KT',
    email: 'karim.touati@naftal.dz',
    phone: '+213 770 88 77 66',
    startDate: '2022-05-15',
    createdAt: new Date().toISOString(),
    daysTotal: 30,
  },
]

const DEFAULT_DAYSOFF = [
  {
    id: 1,
    employeeId: 1,
    startDate: '2026-04-02',
    endDate: '2026-04-04',
    workingDays: 2,
  },
  {
    id: 2,
    employeeId: 2,
    startDate: '2026-04-10',
    endDate: '2026-04-15',
    workingDays: 4,
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

function employeeStats(employee, daysOffRecords, blocks) {
  const period = currentPeriod()

  const daysUsed = daysOffRecords
    .filter((item) => {
      if (item.employeeId !== employee.id) return false
      const start = new Date(item.startDate)
      return start >= period.start && start <= period.end
    })
    .reduce((total, item) => total + (item.workingDays || 0), 0)

  const daysRemaining = (employee.daysTotal || 30) - daysUsed
  const isBlocked = blocks.some((item) => item.employeeId === employee.id && item.isActive)

  let status = 'actif'
  if (isBlocked) status = 'bloqué'
  else if (daysRemaining < 16) status = 'risque'

  return {
    daysUsed,
    daysRemaining,
    status,
    period,
  }
}

function buildEmployeesSnapshot() {
  const employees = readList(EMPLOYEES_KEY, DEFAULT_EMPLOYEES)
  const daysOff = readList(DAYSOFF_KEY, DEFAULT_DAYSOFF)
  const blocks = readList(BLOCKS_KEY, [])

  return employees
    .map((employee) => ({
      ...employee,
      ...employeeStats(employee, daysOff, blocks),
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function buildEmployeeDetails(id) {
  const employeeId = Number(id)
  const employees = buildEmployeesSnapshot()
  const employee = employees.find((item) => item.id === employeeId)

  if (!employee) {
    return null
  }

  const daysOff = readList(DAYSOFF_KEY, DEFAULT_DAYSOFF)
    .filter((item) => item.employeeId === employeeId)
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

  const blocks = readList(BLOCKS_KEY, [])
    .filter((item) => item.employeeId === employeeId)
    .sort((a, b) => new Date(b.blockedAt || 0) - new Date(a.blockedAt || 0))

  const activeBlock = blocks.find((item) => item.isActive) || null

  return {
    ...employee,
    daysOff,
    blocks,
    isBlocked: !!activeBlock,
    activeBlock,
  }
}

/**
 * Hook to fetch and manage employees list
 */
export function useEmployees() {
  const [employees, setEmployees] = useState(() => buildEmployeesSnapshot())
  const loading = false
  const [error, setError] = useState(null)

  useEffect(() => {
    const syncEmployees = () => {
      setEmployees(buildEmployeesSnapshot())
    }

    const onStorage = (event) => {
      if (event.key === EMPLOYEES_KEY || event.key === DAYSOFF_KEY || event.key === BLOCKS_KEY) {
        syncEmployees()
      }
    }

    window.addEventListener(UPDATE_EVENT, syncEmployees)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncEmployees)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const refetch = () => {
    setEmployees(buildEmployeesSnapshot())
  }

  const addEmployee = async (employeeData) => {
    try {
      setError(null)

      const currentEmployees = readList(EMPLOYEES_KEY, DEFAULT_EMPLOYEES)
      const exists = currentEmployees.some((item) => item.matricule === employeeData.matricule)
      if (exists) {
        throw new Error('Matricule déjà utilisé')
      }

      const nextId = currentEmployees.length
        ? Math.max(...currentEmployees.map((item) => item.id)) + 1
        : 1

      const newEmployee = {
        id: nextId,
        matricule: employeeData.matricule,
        name: employeeData.name,
        department: employeeData.department || 'Administration',
        position: employeeData.position || 'Employé',
        avatar:
          employeeData.avatar ||
          employeeData.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        email: employeeData.email || null,
        phone: employeeData.phone || null,
        startDate: employeeData.startDate || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        daysTotal: employeeData.daysTotal || 30,
      }

      writeList(EMPLOYEES_KEY, [...currentEmployees, newEmployee])
      setEmployees(buildEmployeesSnapshot())
      emitDataChange()

      const createdEmployee = buildEmployeesSnapshot().find((item) => item.id === nextId)
      return createdEmployee
    } catch (err) {
      setError(err.message)
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
  const [employee, setEmployee] = useState(() => buildEmployeeDetails(id))
  const loading = false
  const [error, setError] = useState(null)

  useEffect(() => {
    const syncEmployee = () => {
      if (!id) {
        setEmployee(null)
        return
      }

      const details = buildEmployeeDetails(id)
      if (!details) {
        setError('Employé introuvable')
      } else {
        setError(null)
      }
      setEmployee(details)
    }

    const onStorage = (event) => {
      if (event.key === EMPLOYEES_KEY || event.key === DAYSOFF_KEY || event.key === BLOCKS_KEY) {
        syncEmployee()
      }
    }

    window.addEventListener(UPDATE_EVENT, syncEmployee)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(UPDATE_EVENT, syncEmployee)
      window.removeEventListener('storage', onStorage)
    }
  }, [id])

  const refetch = () => {
    if (!id) {
      setEmployee(null)
      return
    }

    const details = buildEmployeeDetails(id)
    if (!details) {
      setError('Employé introuvable')
      setEmployee(null)
      return
    }

    setError(null)
    setEmployee(details)
  }

  return {
    employee,
    loading,
    error,
    refetch,
  }
}

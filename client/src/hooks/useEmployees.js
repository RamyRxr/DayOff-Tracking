import { useState, useEffect, useCallback } from 'react'
import { getEmployees, getEmployee, createEmployee } from '../api/employees'

function toUiStatus(status) {
    if (status === 'bloqué' || status === 'bloque') return 'bloqué'
    if (status === 'risque' || status === 'a_risque') return 'risque'
    return 'actif'
}

function buildName(employee) {
    if (employee?.name) return employee.name
    const first = employee?.firstName || ''
    const last = employee?.lastName || ''
    return `${first} ${last}`.trim()
}

function buildAvatar(name) {
    if (!name) return 'NA'
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

function toUiEmployee(employee) {
    const name = buildName(employee)
    const daysTotal = 30

    return {
        ...employee,
        id: String(employee.id),
        name,
        avatar: employee.avatar || buildAvatar(name),
        status: toUiStatus(employee.status),
        daysTotal,
        daysUsed: Number(employee.daysUsed || 0),
        daysWorked: Number(employee.daysWorked || 0),
        daysAvailable: Number(employee.daysAvailable ?? (daysTotal - Number(employee.daysUsed || 0))),
        daysRemaining: Number(employee.daysAvailable ?? (daysTotal - Number(employee.daysUsed || 0))),
        startDate: employee.startDate || employee.hireDate || employee.createdAt,
        isBlocked: !!employee.activeBlock,
    }
}

function parseEmployeeName(name) {
    const trimmed = String(name || '').trim()
    if (!trimmed) return { firstName: '', lastName: '' }

    const parts = trimmed.split(/\s+/)
    if (parts.length === 1) {
        return { firstName: parts[0], lastName: parts[0] }
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(' '),
    }
}

/**
 * Hook to fetch and manage employees list
 */
export function useEmployees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const refetch = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getEmployees()
            const list = Array.isArray(response?.data) ? response.data.map(toUiEmployee) : []
            setEmployees(list)
        } catch (err) {
            setError(err.message || 'Error loading employees')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        let cancelled = false

        async function loadEmployees() {
            try {
                const response = await getEmployees()
                if (cancelled) return
                const list = Array.isArray(response?.data) ? response.data.map(toUiEmployee) : []
                setError(null)
                setEmployees(list)
            } catch (err) {
                if (cancelled) return
                setError(err.message || 'Error loading employees')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadEmployees()

        return () => {
            cancelled = true
        }
    }, [])

    const addEmployee = async (employeeData) => {
        try {
            setError(null)

            const hasDirectNames = employeeData.firstName && employeeData.lastName
            const parsedNames = hasDirectNames
                ? { firstName: employeeData.firstName, lastName: employeeData.lastName }
                : parseEmployeeName(employeeData.name)

            const payload = {
                firstName: parsedNames.firstName,
                lastName: parsedNames.lastName,
                email: employeeData.email,
                phone: employeeData.phone || null,
                department: employeeData.department,
                position: employeeData.position,
                hireDate: employeeData.hireDate || employeeData.startDate || new Date().toISOString().slice(0, 10),
                matricule: employeeData.matricule,
            }

            const response = await createEmployee(payload)
            const created = toUiEmployee(response.data)
            setEmployees((prev) => [created, ...prev])
            return created
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
    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const refetch = useCallback(async () => {
        if (!id) {
            setEmployee(null)
            setError(null)
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            setError(null)
            const response = await getEmployee(id)
            const mapped = toUiEmployee(response.data)
            setEmployee({
                ...mapped,
                daysOff: Array.isArray(response.data?.daysOff) ? response.data.daysOff : [],
                blocks: response.data?.activeBlock ? [response.data.activeBlock] : [],
                activeBlock: response.data?.activeBlock || null,
                isBlocked: !!response.data?.activeBlock,
            })
        } catch (err) {
            setEmployee(null)
            setError(err.message || 'Erreur lors du chargement de l\'employé')
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        let cancelled = false

        async function loadEmployee() {
            if (!id) {
                if (!cancelled) {
                    setEmployee(null)
                    setError(null)
                    setLoading(false)
                }
                return
            }

            try {
                const response = await getEmployee(id)
                if (cancelled) return
                const mapped = toUiEmployee(response.data)
                setError(null)
                setEmployee({
                    ...mapped,
                    daysOff: Array.isArray(response.data?.daysOff) ? response.data.daysOff : [],
                    blocks: response.data?.activeBlock ? [response.data.activeBlock] : [],
                    activeBlock: response.data?.activeBlock || null,
                    isBlocked: !!response.data?.activeBlock,
                })
            } catch (err) {
                if (cancelled) return
                setEmployee(null)
                setError(err.message || 'Erreur lors du chargement de l\'employé')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadEmployee()

        return () => {
            cancelled = true
        }
    }, [id])

    return {
        employee,
        loading,
        error,
        refetch,
    }
}

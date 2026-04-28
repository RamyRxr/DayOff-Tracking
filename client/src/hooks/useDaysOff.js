import { useState, useEffect, useCallback } from 'react'
import { getDaysOff, createDayOff } from '../api/daysoff'

function countWorkingDays(startDate, endDate) {
    let count = 0
    const cursor = new Date(startDate)
    const end = new Date(endDate)

    while (cursor <= end) {
        const day = cursor.getDay()
        if (day !== 5 && day !== 6) count += 1
        cursor.setDate(cursor.getDate() + 1)
    }

    return count
}

function mapDayOff(dayOff) {
    const workingDays = countWorkingDays(dayOff.startDate, dayOff.endDate)
    const calendarDays =
        Math.floor(
            (new Date(dayOff.endDate).getTime() - new Date(dayOff.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1

    return {
        ...dayOff,
        id: String(dayOff.id),
        employeeId: String(dayOff.employeeId),
        workingDays,
        calendarDays,
        isSandwich: calendarDays > workingDays,
    }
}

/**
 * Hook to fetch and manage day-off records
 */
export function useDaysOff(filters = {}) {
    const employeeId = filters.employeeId ? String(filters.employeeId) : undefined
    const periodStart = filters.periodStart
    const periodEnd = filters.periodEnd

    const [daysOff, setDaysOff] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const refetch = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getDaysOff({ employeeId, periodStart, periodEnd })
            const records = Array.isArray(response?.data) ? response.data.map(mapDayOff) : []
            setDaysOff(records)
        } catch (err) {
            setError(err.message || 'Error loading days off')
        } finally {
            setLoading(false)
        }
    }, [employeeId, periodStart, periodEnd])

    useEffect(() => {
        let cancelled = false

        async function loadDaysOff() {
            try {
                const response = await getDaysOff({ employeeId, periodStart, periodEnd })
                if (cancelled) return
                const records = Array.isArray(response?.data) ? response.data.map(mapDayOff) : []
                setError(null)
                setDaysOff(records)
            } catch (err) {
                if (cancelled) return
                setError(err.message || 'Error loading days off')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadDaysOff()

        return () => {
            cancelled = true
        }
    }, [employeeId, periodStart, periodEnd])

    const addDayOff = async (dayOffData) => {
        try {
            setError(null)

            const payload = {
                employeeId: String(dayOffData.employeeId),
                startDate: dayOffData.startDate,
                endDate: dayOffData.endDate,
                type: dayOffData.type || 'Congé annuel',
                reason: dayOffData.reason || null,
                justification: dayOffData.justification || null,
            }

            const response = await createDayOff(payload)
            const created = mapDayOff(response.data.dayOff)
            setDaysOff((prev) => [created, ...prev])

            return {
                dayOff: created,
                stats: {
                    workingDays: response.data.workingDays,
                    isSandwich: response.data.sandwichDetected,
                },
                block: response.data.autoBlocked
                    ? {
                        reason: 'Dépassement du quota de congés',
                    }
                    : null,
            }
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

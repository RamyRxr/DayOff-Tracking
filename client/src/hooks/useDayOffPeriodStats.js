import { useMemo } from 'react'
import { MAX_DAY_OFF_DAYS } from '../utils/leavePolicy'

export function useDayOffPeriodStats({ daysOff, displayedPeriod, isEmployeeSelected }) {
    return useMemo(() => {
        const existingDates = new Set()

        if (!isEmployeeSelected) {
            return {
                existingDates,
                periodStats: {
                    daysOffCountPast: 0,
                    daysOffCountTotal: 0,
                    workedDays: 0,
                    availableDays: MAX_DAY_OFF_DAYS,
                },
            }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let daysOffCountPast = 0
        let daysOffCountTotal = 0

        daysOff?.forEach((dayOff) => {
            const startStr = dayOff.startDate.split('T')[0]
            const endStr = dayOff.endDate.split('T')[0]
            const [startY, startM, startD] = startStr.split('-').map(Number)
            const [endY, endM, endD] = endStr.split('-').map(Number)

            const start = new Date(startY, startM - 1, startD)
            const end = new Date(endY, endM - 1, endD)

            const current = new Date(start)
            while (current <= end) {
                const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
                existingDates.add(dateStr)

                if (current >= displayedPeriod.start && current <= displayedPeriod.end) {
                    const dayOfWeek = current.getDay()
                    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                        daysOffCountTotal++
                        if (current <= today) {
                            daysOffCountPast++
                        }
                    }
                }
                current.setDate(current.getDate() + 1)
            }
        })

        let workedDays = 0
        if (today >= displayedPeriod.start && today <= displayedPeriod.end) {
            const current = new Date(displayedPeriod.start)
            while (current <= today) {
                const dayOfWeek = current.getDay()
                if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                    workedDays++
                }
                current.setDate(current.getDate() + 1)
            }
            workedDays = Math.max(0, workedDays - daysOffCountPast)
        } else if (today > displayedPeriod.end) {
            const current = new Date(displayedPeriod.start)
            while (current <= displayedPeriod.end) {
                const dayOfWeek = current.getDay()
                if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                    workedDays++
                }
                current.setDate(current.getDate() + 1)
            }
            workedDays = Math.max(0, workedDays - daysOffCountTotal)
        }

        const availableDays = Math.max(0, MAX_DAY_OFF_DAYS - daysOffCountTotal)

        return {
            existingDates,
            periodStats: {
                daysOffCountPast,
                daysOffCountTotal,
                workedDays,
                availableDays,
            },
        }
    }, [daysOff, displayedPeriod, isEmployeeSelected])
}

import { useMemo } from 'react'
import { MAX_DAY_OFF_DAYS } from '../utils/leavePolicy'
import { parseLocalDateString, toLocalDateString } from '../utils/localDate'

export function useEmployeeDayOffStats({ daysOff, periodStartDate, periodEndDate }) {
    return useMemo(() => {
        const dayOffDates = new Set()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let totalDayOffDays = 0
        let pastDayOffDays = 0

        daysOff?.forEach((dayOff) => {
            // Parse dates exactly like AddDayOffModal
            const startStr = dayOff.startDate.split('T')[0]
            const endStr = dayOff.endDate.split('T')[0]
            const start = parseLocalDateString(startStr)
            const end = parseLocalDateString(endStr)

            // Calculate total days and working days for this day-off record
            const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
            let workingDayCount = 0
            const tempCurrent = new Date(start)
            while (tempCurrent <= end) {
                const day = tempCurrent.getDay()
                if (day !== 5 && day !== 6) workingDayCount++
                tempCurrent.setDate(tempCurrent.getDate() + 1)
            }

            // Detect sandwich: working days on both ends with weekends in between
            const startDayOfWeek = start.getDay()
            const endDayOfWeek = end.getDay()
            const isStartWorkingDay = startDayOfWeek !== 5 && startDayOfWeek !== 6
            const isEndWorkingDay = endDayOfWeek !== 5 && endDayOfWeek !== 6
            const isSandwich = isStartWorkingDay && isEndWorkingDay && totalDays > workingDayCount
            const dayOffCount = isSandwich ? totalDays : workingDayCount

            // Add all dates to the set and count days in period
            const current = new Date(start)
            let daysInPeriod = 0
            let pastDaysInPeriod = 0

            while (current <= end) {
                // Store as YYYY-MM-DD string using local date (same as AddDayOffModal)
                const dateStr = toLocalDateString(current)
                dayOffDates.add(dateStr)

                if (current >= periodStartDate && current <= periodEndDate) {
                    daysInPeriod++
                    if (current <= today) {
                        pastDaysInPeriod++
                    }
                }
                current.setDate(current.getDate() + 1)
            }

            // If this day-off overlaps with period, add the proportional count
            if (daysInPeriod > 0) {
                // Calculate what portion of this day-off falls in the period
                const portionInPeriod = daysInPeriod / totalDays
                const dayOffInPeriod = Math.round(dayOffCount * portionInPeriod)
                totalDayOffDays += dayOffInPeriod

                const pastPortion = pastDaysInPeriod / totalDays
                const pastDayOffInPeriod = Math.round(dayOffCount * pastPortion)
                pastDayOffDays += pastDayOffInPeriod
            }
        })

        let daysActuallyWorked = 0
        if (today >= periodStartDate && today <= periodEndDate) {
            const current = new Date(periodStartDate)
            while (current <= today) {
                const dayOfWeek = current.getDay()
                if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                    daysActuallyWorked++
                }
                current.setDate(current.getDate() + 1)
            }
            daysActuallyWorked = Math.max(0, daysActuallyWorked - pastDayOffDays)
        } else if (today > periodEndDate) {
            const current = new Date(periodStartDate)
            while (current <= periodEndDate) {
                const dayOfWeek = current.getDay()
                if (dayOfWeek !== 5 && dayOfWeek !== 6) {
                    daysActuallyWorked++
                }
                current.setDate(current.getDate() + 1)
            }
            daysActuallyWorked = Math.max(0, daysActuallyWorked - totalDayOffDays)
        }

        return {
            dayOffDates,
            totalDayOffDays,
            pastDayOffDays,
            daysActuallyWorked,
            daysAvailable: Math.max(0, MAX_DAY_OFF_DAYS - totalDayOffDays),
        }
    }, [daysOff, periodStartDate, periodEndDate])
}

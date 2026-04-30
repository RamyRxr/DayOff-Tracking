const prisma = require('../lib/prisma')
const {
    getCurrentPeriod,
    countWorkingDays,
    isSandwich,
    shouldBlock,
} = require('../utils/period')

function inCurrentPeriod(date, period) {
    const target = new Date(date)
    return target >= period.start && target <= period.end
}

function sumDaysUsed(records) {
    return records.reduce(
        (sum, record) => sum + countWorkingDays(new Date(record.startDate), new Date(record.endDate)),
        0
    )
}

async function getDaysOff(req, res) {
    try {
        const { employeeId, periodStart, periodEnd } = req.query
        const currentPeriod = getCurrentPeriod()

        let rangeStart = currentPeriod.start
        let rangeEnd = currentPeriod.end

        if (periodStart || periodEnd) {
            const parsedStart = periodStart ? new Date(periodStart) : null
            const parsedEnd = periodEnd ? new Date(periodEnd) : null

            if (parsedStart && Number.isNaN(parsedStart.getTime())) {
                return res.status(400).json({ error: 'Invalid periodStart' })
            }
            if (parsedEnd && Number.isNaN(parsedEnd.getTime())) {
                return res.status(400).json({ error: 'Invalid periodEnd' })
            }

            rangeStart = parsedStart || currentPeriod.start
            rangeEnd = parsedEnd || currentPeriod.end
        }

        const where = {
            ...(employeeId ? { employeeId: String(employeeId) } : {}),
            AND: [
                { endDate: { gte: rangeStart } },
                { startDate: { lte: rangeEnd } },
            ],
        }

        const records = await prisma.dayOff.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        matricule: true,
                        department: true,
                    }
                },
                admin: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        })

        // Transform employee data to match frontend expectations
        const transformedRecords = records.map(record => ({
            ...record,
            employee: record.employee ? {
                ...record.employee,
                name: `${record.employee.firstName} ${record.employee.lastName}`,
                avatar: `${record.employee.firstName[0]}${record.employee.lastName[0]}`.toUpperCase()
            } : null
        }))

        return res.json({ data: transformedRecords })
    } catch (error) {
        console.error('Error fetching day-off records:', error)
        return res.status(500).json({ error: 'Failed to fetch day-off records' })
    }
}

async function createDayOff(req, res) {
    try {
        const { employeeId, startDate, endDate, type, reason, justification, adminId } = req.body

        if (!employeeId || !startDate || !endDate || !type) {
            return res
                .status(400)
                .json({ error: 'Missing required fields: employeeId, startDate, endDate, type' })
        }

        // Validate adminId if provided
        if (adminId) {
            const admin = await prisma.admin.findUnique({
                where: { id: String(adminId) },
                select: { id: true },
            })
            if (!admin) {
                return res.status(404).json({ error: 'Admin not found' })
            }
        }

        const parsedStartDate = new Date(startDate)
        const parsedEndDate = new Date(endDate)

        if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' })
        }

        if (parsedStartDate > parsedEndDate) {
            return res.status(400).json({ error: 'startDate must be before or equal to endDate' })
        }

        const employee = await prisma.employee.findUnique({
            where: { id: String(employeeId) },
            select: { id: true },
        })

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' })
        }

        const period = getCurrentPeriod()
        const existing = await prisma.dayOff.findMany({
            where: {
                employeeId: String(employeeId),
            },
            select: {
                startDate: true,
                endDate: true,
            },
        })

        const existingInPeriod = existing.filter((record) => inCurrentPeriod(record.startDate, period))

        const workingDays = countWorkingDays(parsedStartDate, parsedEndDate)
        const sandwichDetected = isSandwich(parsedStartDate, parsedEndDate)
        const totalDaysUsed = sumDaysUsed(existingInPeriod) + workingDays

        const result = await prisma.$transaction(async (tx) => {
            const dayOff = await tx.dayOff.create({
                data: {
                    employeeId: String(employeeId),
                    startDate: parsedStartDate,
                    endDate: parsedEndDate,
                    type: String(type),
                    reason: reason ? String(reason) : null,
                    justification: justification ? String(justification) : null,
                    adminId: adminId ? String(adminId) : null,
                },
            })

            // Update employee status based on days used (no auto-block)
            let nextStatus = 'actif'
            if (totalDaysUsed > 15) {
                nextStatus = 'doit_bloquer'  // Must block - admin needs to block manually
            } else if ((30 - totalDaysUsed) < 16) {
                nextStatus = 'a_risque'
            }

            await tx.employee.update({
                where: { id: String(employeeId) },
                data: {
                    status: nextStatus,
                    updatedAt: new Date(),
                },
            })

            return dayOff
        })

        return res.status(201).json({
            data: {
                dayOff: result,
                sandwichDetected,
                workingDays,
            },
        })
    } catch (error) {
        console.error('Error creating day-off:', error)
        return res.status(500).json({ error: 'Failed to create day-off' })
    }
}

module.exports = {
    getDaysOff,
    createDayOff,
}
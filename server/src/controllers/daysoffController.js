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
        const { employeeId } = req.query
        const period = getCurrentPeriod()

        const where = employeeId
            ? { employeeId: String(employeeId) }
            : {
                startDate: {
                    gte: period.start,
                    lte: period.end,
                },
            }

        const records = await prisma.dayOff.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })

        return res.json({ data: records })
    } catch (error) {
        console.error('Error fetching day-off records:', error)
        return res.status(500).json({ error: 'Failed to fetch day-off records' })
    }
}

async function createDayOff(req, res) {
    try {
        const { employeeId, startDate, endDate, type, reason, justification } = req.body

        if (!employeeId || !startDate || !endDate || !type) {
            return res
                .status(400)
                .json({ error: 'Missing required fields: employeeId, startDate, endDate, type' })
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

        let autoBlocked = false

        const result = await prisma.$transaction(async (tx) => {
            const dayOff = await tx.dayOff.create({
                data: {
                    employeeId: String(employeeId),
                    startDate: parsedStartDate,
                    endDate: parsedEndDate,
                    type: String(type),
                    reason: reason ? String(reason) : null,
                    justification: justification ? String(justification) : null,
                },
            })

            const activeBlock = await tx.block.findFirst({
                where: {
                    employeeId: String(employeeId),
                    isActive: true,
                },
            })

            if (shouldBlock(totalDaysUsed) && !activeBlock) {
                const firstAdmin = await tx.admin.findFirst({
                    orderBy: { createdAt: 'asc' },
                    select: { id: true },
                })

                if (!firstAdmin) {
                    throw new Error('No admin found for automatic block')
                }

                await tx.block.create({
                    data: {
                        employeeId: String(employeeId),
                        adminId: firstAdmin.id,
                        reason: 'Dépassement du quota de congés',
                        description: 'Blocage automatique — seuil de 16 jours atteint',
                        isActive: true,
                    },
                })

                await tx.employee.update({
                    where: { id: String(employeeId) },
                    data: {
                        status: 'bloque',
                    },
                })

                autoBlocked = true
            } else {
                const nextStatus = (30 - totalDaysUsed) < 16 ? 'a_risque' : 'actif'
                await tx.employee.update({
                    where: { id: String(employeeId) },
                    data: {
                        status: nextStatus,
                    },
                })
            }

            await tx.employee.update({
                where: { id: String(employeeId) },
                data: {
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
                autoBlocked,
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
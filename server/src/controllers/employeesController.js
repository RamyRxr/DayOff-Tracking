const prisma = require('../lib/prisma')
const {
    getCurrentPeriod,
    countWorkingDays,
    shouldBlock,
    workingDaysElapsed,
} = require('../utils/period')

function getDaysUsedInPeriod(daysOff, period) {
    return daysOff
        .filter((record) => {
            const start = new Date(record.startDate)
            return start >= period.start && start <= period.end
        })
        .reduce(
            (sum, record) => sum + countWorkingDays(new Date(record.startDate), new Date(record.endDate)),
            0
        )
}

async function getEmployees(req, res) {
    try {
        const employees = await prisma.employee.findMany({
            include: {
                daysOff: {
                    select: {
                        startDate: true,
                        endDate: true,
                    },
                },
                blocks: {
                    where: { isActive: true },
                    include: {
                        admin: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        })

        const period = getCurrentPeriod()
        const daysWorked = workingDaysElapsed()

        const result = employees.map((employee) => {
            const daysUsed = getDaysUsedInPeriod(employee.daysOff, period)
            const daysAvailable = 30 - daysUsed
            const activeBlock = employee.status === 'bloque' ? employee.blocks[0] || null : null
            const isAtRisk = daysAvailable < 16 && !activeBlock

            return {
                ...employee,
                daysUsed,
                daysWorked,
                daysAvailable,
                isAtRisk,
                activeBlock,
            }
        })

        return res.json({ data: result })
    } catch (error) {
        console.error('Error fetching employees:', error)
        return res.status(500).json({ error: 'Failed to fetch employees' })
    }
}

async function getEmployeeById(req, res) {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Missing employee id' })
        }

        const employee = await prisma.employee.findUnique({
            where: { id: String(id) },
            include: {
                daysOff: {
                    orderBy: { createdAt: 'desc' },
                },
                blocks: {
                    where: { isActive: true },
                    include: {
                        admin: {
                            select: {
                                id: true,
                                name: true,
                                role: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' })
        }

        const period = getCurrentPeriod()
        const currentPeriodDaysOff = employee.daysOff.filter((record) => {
            const start = new Date(record.startDate)
            return start >= period.start && start <= period.end
        })

        const daysUsed = getDaysUsedInPeriod(currentPeriodDaysOff, period)
        const daysWorked = workingDaysElapsed()
        const daysAvailable = 30 - daysUsed
        const activeBlock = employee.status === 'bloque' ? employee.blocks[0] || null : null
        const isAtRisk = daysAvailable < 16 && !activeBlock

        return res.json({
            data: {
                ...employee,
                daysOff: currentPeriodDaysOff,
                activeBlock,
                daysUsed,
                daysWorked,
                daysAvailable,
                isAtRisk,
            },
        })
    } catch (error) {
        console.error('Error fetching employee details:', error)
        return res.status(500).json({ error: 'Failed to fetch employee' })
    }
}

async function createEmployee(req, res) {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            ssn,
            department,
            position,
            hireDate,
            matricule,
        } = req.body

        if (!firstName || !lastName || !email || !department || !position || !hireDate || !matricule) {
            return res.status(400).json({
                error:
                    'Missing required fields: firstName, lastName, email, department, position, hireDate, matricule',
            })
        }

        const existingMatricule = await prisma.employee.findUnique({ where: { matricule } })
        if (existingMatricule) {
            return res.status(400).json({ error: 'Matricule already exists' })
        }

        const existingEmail = await prisma.employee.findUnique({ where: { email } })
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already exists' })
        }

        const employee = await prisma.employee.create({
            data: {
                firstName: String(firstName).trim(),
                lastName: String(lastName).trim(),
                email: String(email).trim().toLowerCase(),
                phone: phone ? String(phone).trim() : null,
                ssn: ssn ? String(ssn).trim() : null,
                department: String(department).trim(),
                position: String(position).trim(),
                hireDate: new Date(hireDate),
                matricule: String(matricule).trim(),
            },
        })

        return res.status(201).json({ data: employee })
    } catch (error) {
        console.error('Error creating employee:', error)
        return res.status(500).json({ error: 'Failed to create employee' })
    }
}

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
}

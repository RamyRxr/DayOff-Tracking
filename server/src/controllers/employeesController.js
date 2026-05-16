const prisma = require('../lib/prisma')
const {
    getCurrentPeriod,
    countDayOffDays,
    shouldBlock,
    workingDaysElapsed,
} = require('../utils/period')

function getDaysUsedInPeriod(daysOff, period) {
    return daysOff.reduce((sum, record) => {
        const start = new Date(record.startDate)
        const end = new Date(record.endDate)

        // Skip if completely outside the period
        if (end < period.start || start > period.end) {
            return sum
        }

        // Calculate overlap with the period
        const overlapStart = start < period.start ? period.start : start
        const overlapEnd = end > period.end ? period.end : end

        // Count day-off days with sandwich detection
        return sum + countDayOffDays(overlapStart, overlapEnd)
    }, 0)
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

            // Check if employee has an active block
            const activeBlock = employee.blocks.find(b => b.isActive) || null

            // Calculate status based on blocks and days available
            let status
            if (activeBlock) {
                status = 'bloque'
            } else if (daysAvailable < 0) {
                status = 'doit_bloquer'
            } else if (daysAvailable < 16) {
                status = 'a_risque'
            } else {
                status = 'actif'
            }

            const isAtRisk = daysAvailable < 16 && !activeBlock

            return {
                ...employee,
                status,
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

        // Check if employee has an active block
        const activeBlock = employee.blocks.find(b => b.isActive) || null

        // Calculate status based on blocks and days available
        let status
        if (activeBlock) {
            status = 'bloque'
        } else if (daysAvailable < 0) {
            status = 'doit_bloquer'
        } else if (daysAvailable < 16) {
            status = 'a_risque'
        } else {
            status = 'actif'
        }

        const isAtRisk = daysAvailable < 16 && !activeBlock

        return res.json({
            data: {
                ...employee,
                status,
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

        if (!firstName || !lastName || !email || !phone || !ssn || !department || !position || !hireDate || !matricule) {
            return res.status(400).json({
                error:
                    'Missing required fields: firstName, lastName, email, phone, ssn, department, position, hireDate, matricule',
            })
        }

        // Validate SSN length
        if (ssn.trim().length !== 15) {
            return res.status(400).json({
                error: 'SSN must be exactly 15 characters',
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
                phone: String(phone).trim(),
                ssn: String(ssn).trim(),
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

async function deleteAllEmployees(req, res) {
    try {
        const { superadminPin } = req.body

        // Verify superadmin PIN
        if (superadminPin !== '0147') {
            return res.status(403).json({ error: 'Code superadmin incorrect' })
        }

        // Delete all employees (cascades to daysOff and blocks due to Prisma schema)
        const result = await prisma.employee.deleteMany({})

        return res.json({
            success: true,
            deleted: result.count,
            message: `${result.count} employés supprimés`
        })
    } catch (error) {
        console.error('Error deleting all employees:', error)
        return res.status(500).json({ error: 'Failed to delete employees' })
    }
}

async function importEmployees(req, res) {
    try {
        const multer = require('multer')
        const upload = multer({ storage: multer.memoryStorage() })

        // Handle file upload
        upload.single('file')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: 'File upload error' })
            }

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' })
            }

            const fileContent = req.file.buffer.toString('utf-8')
            const fileType = req.file.originalname.endsWith('.json') ? 'json' : 'csv'

            let employees = []

            if (fileType === 'json') {
                employees = JSON.parse(fileContent)
            } else {
                // Parse CSV
                const lines = fileContent.split('\n').filter(line => line.trim())
                const headers = lines[0].split(',').map(h => h.trim())

                for (let i = 1; i < lines.length; i++) {
                    const values = lines[i].split(',').map(v => v.trim())
                    const employee = {}
                    headers.forEach((header, index) => {
                        employee[header] = values[index]
                    })
                    employees.push(employee)
                }
            }

            // Validate required fields
            const required = ['matricule', 'firstName', 'lastName', 'email', 'phone', 'ssn', 'department', 'position', 'hireDate']
            for (const emp of employees) {
                for (const field of required) {
                    if (!emp[field]) {
                        return res.status(400).json({ error: `Missing required field: ${field}` })
                    }
                }
            }

            // Import employees
            let imported = 0
            for (const emp of employees) {
                try {
                    await prisma.employee.create({
                        data: {
                            matricule: String(emp.matricule).trim(),
                            firstName: String(emp.firstName).trim(),
                            lastName: String(emp.lastName).trim(),
                            email: String(emp.email).trim(),
                            phone: String(emp.phone).trim(),
                            ssn: String(emp.ssn).trim(),
                            department: String(emp.department).trim(),
                            position: String(emp.position).trim(),
                            hireDate: new Date(emp.hireDate),
                            status: 'actif'
                        }
                    })
                    imported++
                } catch (error) {
                    console.error(`Error importing employee ${emp.matricule}:`, error)
                }
            }

            return res.json({
                success: true,
                imported,
                total: employees.length,
                message: `${imported}/${employees.length} employés importés`
            })
        })
    } catch (error) {
        console.error('Error importing employees:', error)
        return res.status(500).json({ error: 'Failed to import employees' })
    }
}

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    deleteAllEmployees,
    importEmployees,
}

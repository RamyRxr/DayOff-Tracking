import express from 'express'
import { PrismaClient } from '@prisma/client'
import {
  getCurrentPeriod,
  countWorkingDays,
  shouldBlock,
} from '../utils/period.js'

const router = express.Router()
const prisma = new PrismaClient()

/**
 * GET /api/employees
 * List all employees with period stats
 */
router.get('/', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        daysOff: true,
        blocks: {
          where: { isActive: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const period = getCurrentPeriod()

    // Calculate stats for each employee
    const employeesWithStats = employees.map((employee) => {
      // Count days used in current period
      const periodDaysOff = employee.daysOff.filter(
        (dayOff) =>
          new Date(dayOff.startDate) >= period.start &&
          new Date(dayOff.startDate) <= period.end
      )

      const daysUsed = periodDaysOff.reduce(
        (sum, dayOff) => sum + dayOff.workingDays,
        0
      )

      const daysRemaining = employee.daysTotal - daysUsed
      const isBlocked = employee.blocks.length > 0
      const isAtRisk = !isBlocked && shouldBlock(employee.daysTotal, daysUsed)

      let status = 'actif'
      if (isBlocked) status = 'bloqué'
      else if (isAtRisk) status = 'risque'

      return {
        id: employee.id,
        matricule: employee.matricule,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        avatar: employee.avatar,
        daysUsed,
        daysTotal: employee.daysTotal,
        daysRemaining,
        status,
        period: {
          start: period.start,
          end: period.end,
        },
      }
    })

    res.json({ data: employeesWithStats })
  } catch (error) {
    console.error('Error fetching employees:', error)
    res.status(500).json({ error: 'Failed to fetch employees' })
  }
})

/**
 * GET /api/employees/:id
 * Get single employee with full details and day-off history
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        daysOff: {
          orderBy: { startDate: 'desc' },
        },
        blocks: {
          include: {
            blockedBy: true,
            unblockedBy: true,
          },
          orderBy: { blockedAt: 'desc' },
        },
      },
    })

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' })
    }

    const period = getCurrentPeriod()

    // Calculate current period stats
    const periodDaysOff = employee.daysOff.filter(
      (dayOff) =>
        new Date(dayOff.startDate) >= period.start &&
        new Date(dayOff.startDate) <= period.end
    )

    const daysUsed = periodDaysOff.reduce(
      (sum, dayOff) => sum + dayOff.workingDays,
      0
    )

    const daysRemaining = employee.daysTotal - daysUsed
    const activeBlock = employee.blocks.find((block) => block.isActive)

    res.json({
      data: {
        ...employee,
        daysUsed,
        daysRemaining,
        period: {
          start: period.start,
          end: period.end,
        },
        isBlocked: !!activeBlock,
        activeBlock,
      },
    })
  } catch (error) {
    console.error('Error fetching employee:', error)
    res.status(500).json({ error: 'Failed to fetch employee' })
  }
})

/**
 * POST /api/employees
 * Create new employee
 */
router.post('/', async (req, res) => {
  try {
    const { matricule, name, department, position, avatar } = req.body

    // Validation
    if (!matricule || !name || !department || !position) {
      return res.status(400).json({
        error: 'Missing required fields: matricule, name, department, position',
      })
    }

    // Check if matricule already exists
    const existing = await prisma.employee.findUnique({
      where: { matricule },
    })

    if (existing) {
      return res.status(400).json({ error: 'Matricule already exists' })
    }

    const employee = await prisma.employee.create({
      data: {
        matricule,
        name,
        department,
        position,
        avatar: avatar || name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
        daysTotal: 30,
        status: 'actif',
      },
    })

    res.status(201).json({ data: employee })
  } catch (error) {
    console.error('Error creating employee:', error)
    res.status(500).json({ error: 'Failed to create employee' })
  }
})

export default router

import express from 'express'
import { PrismaClient } from '@prisma/client'
import {
  countWorkingDays,
  countCalendarDays,
  detectSandwich,
  shouldBlock,
  getCurrentPeriod,
} from '../utils/period.js'

const router = express.Router()
const prisma = new PrismaClient()

/**
 * POST /api/daysoff
 * Add new day-off request with sandwich detection and auto-block
 */
router.post('/', async (req, res) => {
  try {
    const { employeeId, startDate, endDate, reason, justification } = req.body

    // Validation
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required fields: employeeId, startDate, endDate',
      })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' })
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(employeeId) },
      include: {
        daysOff: true,
        blocks: { where: { isActive: true } },
      },
    })

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' })
    }

    // Check if employee is blocked
    if (employee.blocks.length > 0) {
      return res.status(403).json({
        error: 'Employee is currently blocked and cannot request day-off',
      })
    }

    // Calculate working days and calendar days
    const workingDays = countWorkingDays(start, end)
    const calendarDays = countCalendarDays(start, end)
    const isSandwich = detectSandwich(start, end)

    // Calculate current period days used
    const period = getCurrentPeriod()
    const periodDaysOff = employee.daysOff.filter(
      (dayOff) =>
        new Date(dayOff.startDate) >= period.start &&
        new Date(dayOff.startDate) <= period.end
    )

    const currentDaysUsed = periodDaysOff.reduce(
      (sum, dayOff) => sum + dayOff.workingDays,
      0
    )

    const newTotalDaysUsed = currentDaysUsed + workingDays
    const daysRemaining = employee.daysTotal - newTotalDaysUsed

    // Check if this would trigger a block
    const wouldTriggerBlock = shouldBlock(employee.daysTotal, newTotalDaysUsed)

    // Create day-off record
    const dayOff = await prisma.dayOff.create({
      data: {
        employeeId: parseInt(employeeId),
        startDate: start,
        endDate: end,
        workingDays,
        calendarDays,
        isSandwich,
        reason,
        justification,
      },
    })

    // Auto-block if triggered
    let blockRecord = null
    if (wouldTriggerBlock) {
      blockRecord = await prisma.block.create({
        data: {
          employeeId: parseInt(employeeId),
          reason: `Blocage automatique - Jours restants: ${daysRemaining}/${employee.daysTotal}`,
          daysUsed: newTotalDaysUsed,
          daysRemaining,
          blockedById: 1, // System/auto-block - using admin ID 1
          isActive: true,
        },
      })

      // Update employee status
      await prisma.employee.update({
        where: { id: parseInt(employeeId) },
        data: { status: 'bloqué' },
      })
    }

    res.status(201).json({
      data: {
        dayOff,
        stats: {
          workingDays,
          calendarDays,
          isSandwich,
          daysUsed: newTotalDaysUsed,
          daysRemaining,
          wouldTriggerBlock,
        },
        block: blockRecord,
      },
    })
  } catch (error) {
    console.error('Error creating day-off:', error)
    res.status(500).json({ error: 'Failed to create day-off' })
  }
})

/**
 * GET /api/daysoff
 * Get all day-off records (optional: filter by employeeId or period)
 */
router.get('/', async (req, res) => {
  try {
    const { employeeId, periodStart, periodEnd } = req.query

    const where = {}

    if (employeeId) {
      where.employeeId = parseInt(employeeId)
    }

    if (periodStart && periodEnd) {
      where.startDate = {
        gte: new Date(periodStart),
        lte: new Date(periodEnd),
      }
    }

    const daysOff = await prisma.dayOff.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            matricule: true,
            avatar: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    })

    res.json({ data: daysOff })
  } catch (error) {
    console.error('Error fetching days-off:', error)
    res.status(500).json({ error: 'Failed to fetch days-off' })
  }
})

export default router

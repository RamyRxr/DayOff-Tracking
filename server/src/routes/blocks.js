import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const router = express.Router()
const prisma = new PrismaClient()

/**
 * GET /api/blocks
 * Get all block records (active by default)
 */
router.get('/', async (req, res) => {
  try {
    const { active } = req.query

    const where = active !== 'false' ? { isActive: true } : {}

    const blocks = await prisma.block.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            matricule: true,
            department: true,
            position: true,
            avatar: true,
            daysTotal: true,
          },
        },
        blockedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        unblockedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { blockedAt: 'desc' },
    })

    res.json({ data: blocks })
  } catch (error) {
    console.error('Error fetching blocks:', error)
    res.status(500).json({ error: 'Failed to fetch blocks' })
  }
})

/**
 * POST /api/blocks
 * Block an employee (requires admin PIN verification)
 */
router.post('/', async (req, res) => {
  try {
    const { employeeId, reason, adminId, pin } = req.body

    // Validation
    if (!employeeId || !reason || !adminId || !pin) {
      return res.status(400).json({
        error: 'Missing required fields: employeeId, reason, adminId, pin',
      })
    }

    // Verify admin PIN
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(adminId) },
    })

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' })
    }

    const isPinValid = await bcrypt.compare(pin, admin.pinHash)

    if (!isPinValid) {
      return res.status(401).json({ error: 'Invalid PIN' })
    }

    // Check employee
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

    // Check if already blocked
    if (employee.blocks.length > 0) {
      return res.status(400).json({ error: 'Employee is already blocked' })
    }

    // Calculate days used
    const daysUsed = employee.daysOff.reduce(
      (sum, dayOff) => sum + dayOff.workingDays,
      0
    )

    const daysRemaining = employee.daysTotal - daysUsed

    // Create block record
    const block = await prisma.block.create({
      data: {
        employeeId: parseInt(employeeId),
        reason,
        daysUsed,
        daysRemaining,
        blockedById: parseInt(adminId),
        isActive: true,
      },
      include: {
        employee: true,
        blockedBy: true,
      },
    })

    // Update employee status
    await prisma.employee.update({
      where: { id: parseInt(employeeId) },
      data: { status: 'bloqué' },
    })

    res.status(201).json({ data: block })
  } catch (error) {
    console.error('Error creating block:', error)
    res.status(500).json({ error: 'Failed to create block' })
  }
})

/**
 * PATCH /api/blocks/:id/unblock
 * Unblock an employee (requires admin PIN verification)
 */
router.patch('/:id/unblock', async (req, res) => {
  try {
    const { id } = req.params
    const { adminId, pin } = req.body

    // Validation
    if (!adminId || !pin) {
      return res.status(400).json({
        error: 'Missing required fields: adminId, pin',
      })
    }

    // Verify admin PIN
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(adminId) },
    })

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' })
    }

    const isPinValid = await bcrypt.compare(pin, admin.pinHash)

    if (!isPinValid) {
      return res.status(401).json({ error: 'Invalid PIN' })
    }

    // Get block record
    const block = await prisma.block.findUnique({
      where: { id: parseInt(id) },
      include: { employee: true },
    })

    if (!block) {
      return res.status(404).json({ error: 'Block record not found' })
    }

    if (!block.isActive) {
      return res.status(400).json({ error: 'Block is already inactive' })
    }

    // Update block record
    const updatedBlock = await prisma.block.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
        unblockedById: parseInt(adminId),
        unblockedAt: new Date(),
      },
      include: {
        employee: true,
        blockedBy: true,
        unblockedBy: true,
      },
    })

    // Update employee status to actif or risque
    const daysRemaining = block.employee.daysTotal - block.daysUsed
    const newStatus = daysRemaining < 16 ? 'risque' : 'actif'

    await prisma.employee.update({
      where: { id: block.employeeId },
      data: { status: newStatus },
    })

    res.json({ data: updatedBlock })
  } catch (error) {
    console.error('Error unblocking employee:', error)
    res.status(500).json({ error: 'Failed to unblock employee' })
  }
})

export default router

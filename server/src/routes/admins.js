import express from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const router = express.Router()
const prisma = new PrismaClient()

/**
 * GET /api/admins
 * List all admins (without PIN hashes)
 */
router.get('/', async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    })

    res.json({ data: admins })
  } catch (error) {
    console.error('Error fetching admins:', error)
    res.status(500).json({ error: 'Failed to fetch admins' })
  }
})

/**
 * POST /api/admins/verify-pin
 * Verify admin PIN (for authentication)
 */
router.post('/verify-pin', async (req, res) => {
  try {
    const { adminId, pin } = req.body

    // Validation
    if (!adminId || !pin) {
      return res.status(400).json({
        error: 'Missing required fields: adminId, pin',
      })
    }

    // Get admin
    const admin = await prisma.admin.findUnique({
      where: { id: parseInt(adminId) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pinHash: true,
      },
    })

    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' })
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(pin, admin.pinHash)

    if (!isPinValid) {
      return res.status(401).json({ error: 'Invalid PIN' })
    }

    // Return admin info (without PIN hash)
    const { pinHash, ...adminData } = admin

    res.json({
      data: {
        ...adminData,
        verified: true,
      },
    })
  } catch (error) {
    console.error('Error verifying PIN:', error)
    res.status(500).json({ error: 'Failed to verify PIN' })
  }
})

/**
 * POST /api/admins
 * Create new admin (for setup only - requires super admin)
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, role, pin } = req.body

    // Validation
    if (!name || !email || !role || !pin) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, role, pin',
      })
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        error: 'PIN must be exactly 4 digits',
      })
    }

    // Check if email already exists
    const existing = await prisma.admin.findUnique({
      where: { email },
    })

    if (existing) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 10)

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        role,
        pinHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    res.status(201).json({ data: admin })
  } catch (error) {
    console.error('Error creating admin:', error)
    res.status(500).json({ error: 'Failed to create admin' })
  }
})

export default router

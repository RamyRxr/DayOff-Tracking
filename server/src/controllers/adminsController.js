const bcrypt = require('bcryptjs')
const prisma = require('../lib/prisma')

async function getAdmins(req, res) {
    try {
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        })

        return res.json({ data: admins })
    } catch (error) {
        console.error('Error fetching admins:', error)
        return res.status(500).json({ error: 'Failed to fetch admins' })
    }
}

async function verifyPin(req, res) {
    try {
        const { adminId, pin } = req.body

        if (!adminId || !pin) {
            return res.status(400).json({ error: 'Missing required fields: adminId, pin' })
        }

        const admin = await prisma.admin.findUnique({
            where: { id: String(adminId) },
            select: {
                id: true,
                name: true,
                pinHash: true,
            },
        })

        if (!admin) {
            return res.json({ data: { valid: false } })
        }

        const valid = await bcrypt.compare(String(pin), admin.pinHash)

        if (!valid) {
            return res.json({ data: { valid: false } })
        }

        return res.json({
            data: {
                valid: true,
                adminName: admin.name,
            },
        })
    } catch (error) {
        console.error('Error verifying admin PIN:', error)
        return res.status(500).json({ error: 'Failed to verify PIN' })
    }
}

async function createAdmin(req, res) {
    try {
        const { name, role, pin } = req.body

        if (!name || !role || !pin) {
            return res.status(400).json({ error: 'Missing required fields: name, role, pin' })
        }

        if (pin.length !== 4) {
            return res.status(400).json({ error: 'PIN must be exactly 4 digits' })
        }

        // Hash the PIN
        const pinHash = await bcrypt.hash(String(pin), 10)

        const admin = await prisma.admin.create({
            data: {
                name: String(name).trim(),
                role: String(role).trim(),
                pinHash,
            },
            select: {
                id: true,
                name: true,
                role: true,
                createdAt: true,
            },
        })

        return res.status(201).json({ data: admin })
    } catch (error) {
        console.error('Error creating admin:', error)
        return res.status(500).json({ error: 'Failed to create admin' })
    }
}

async function deleteAdmin(req, res) {
    try {
        const { id } = req.params

        if (!id) {
            return res.status(400).json({ error: 'Missing admin ID' })
        }

        // Check if admin exists
        const admin = await prisma.admin.findUnique({
            where: { id: String(id) }
        })

        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        // Delete the admin
        await prisma.admin.delete({
            where: { id: String(id) }
        })

        return res.json({
            success: true,
            message: 'Admin deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting admin:', error)
        return res.status(500).json({ error: 'Failed to delete admin' })
    }
}

module.exports = {
    getAdmins,
    verifyPin,
    createAdmin,
    deleteAdmin,
}

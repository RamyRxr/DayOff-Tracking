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

module.exports = {
    getAdmins,
    verifyPin,
}

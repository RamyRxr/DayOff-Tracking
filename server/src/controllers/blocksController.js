const prisma = require('../lib/prisma')

async function getBlocks(req, res) {
    try {
        const { active } = req.query
        const where = active === 'false' ? {} : { isActive: true }

        const blocks = await prisma.block.findMany({
            where,
            include: {
                employee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        matricule: true,
                        department: true,
                        email: true,
                        phone: true,
                    },
                },
                admin: {
                    select: {
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return res.json({ data: blocks })
    } catch (error) {
        console.error('Error fetching blocks:', error)
        return res.status(500).json({ error: 'Failed to fetch blocks' })
    }
}

async function createBlock(req, res) {
    try {
        const { employeeId, adminId, reason, description } = req.body

        if (!employeeId || !adminId || !reason) {
            return res.status(400).json({ error: 'Missing required fields: employeeId, adminId, reason' })
        }

        const employee = await prisma.employee.findUnique({
            where: { id: String(employeeId) },
            select: { id: true },
        })
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' })
        }

        const existingBlock = await prisma.block.findFirst({
            where: {
                employeeId: String(employeeId),
                isActive: true,
            },
            select: { id: true },
        })
        if (existingBlock) {
            return res.status(400).json({ error: 'Employee is already blocked' })
        }

        const admin = await prisma.admin.findUnique({
            where: { id: String(adminId) },
            select: { id: true },
        })
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        const block = await prisma.$transaction(async (tx) => {
            const created = await tx.block.create({
                data: {
                    employeeId: String(employeeId),
                    adminId: String(adminId),
                    reason: String(reason),
                    description: description ? String(description) : null,
                    isActive: true,
                },
            })

            await tx.employee.update({
                where: { id: String(employeeId) },
                data: { status: 'bloque' },
            })

            return created
        })

        return res.status(201).json({ data: block })
    } catch (error) {
        console.error('Error creating block:', error)
        return res.status(500).json({ error: 'Failed to create block' })
    }
}

async function unblockBlock(req, res) {
    try {
        const { id } = req.params
        const { adminId, unblockReason, unblockDescription } = req.body

        if (!id || !adminId) {
            return res.status(400).json({ error: 'Missing required fields: id, adminId' })
        }

        const block = await prisma.block.findUnique({
            where: { id: String(id) },
            select: {
                id: true,
                employeeId: true,
                isActive: true,
            },
        })

        if (!block) {
            return res.status(404).json({ error: 'Block not found' })
        }

        if (!block.isActive) {
            return res.status(400).json({ error: 'Block is already inactive' })
        }

        const admin = await prisma.admin.findUnique({
            where: { id: String(adminId) },
            select: { id: true },
        })
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' })
        }

        const updatedBlock = await prisma.$transaction(async (tx) => {
            const updated = await tx.block.update({
                where: { id: String(id) },
                data: {
                    isActive: false,
                    unblockReason: unblockReason ? String(unblockReason) : null,
                    unblockDescription: unblockDescription ? String(unblockDescription) : null,
                    unblockedById: String(adminId),
                    unblockedAt: new Date(),
                },
            })

            await tx.employee.update({
                where: { id: String(block.employeeId) },
                data: { status: 'actif' },
            })

            return updated
        })

        return res.json({ data: updatedBlock })
    } catch (error) {
        console.error('Error unblocking employee:', error)
        return res.status(500).json({ error: 'Failed to unblock employee' })
    }
}

module.exports = {
    getBlocks,
    createBlock,
    unblockBlock,
}

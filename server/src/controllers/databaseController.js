const prisma = require('../lib/prisma')

async function getSchema(req, res) {
    try {
        const superadminPin = req.headers['x-superadmin-pin']

        // Verify superadmin PIN
        if (superadminPin !== '0147') {
            return res.status(403).json({ error: 'Code superadmin incorrect' })
        }

        // Get schema using Prisma's introspection
        const schema = [
            {
                name: 'Employee',
                columns: [
                    { name: 'id', type: 'String (UUID)' },
                    { name: 'matricule', type: 'String (unique)' },
                    { name: 'firstName', type: 'String' },
                    { name: 'lastName', type: 'String' },
                    { name: 'email', type: 'String (unique)' },
                    { name: 'phone', type: 'String?' },
                    { name: 'ssn', type: 'String?' },
                    { name: 'department', type: 'String' },
                    { name: 'position', type: 'String' },
                    { name: 'status', type: 'String' },
                    { name: 'hireDate', type: 'DateTime' },
                    { name: 'createdAt', type: 'DateTime' },
                    { name: 'updatedAt', type: 'DateTime' },
                ]
            },
            {
                name: 'Admin',
                columns: [
                    { name: 'id', type: 'String (UUID)' },
                    { name: 'name', type: 'String' },
                    { name: 'role', type: 'String' },
                    { name: 'pinHash', type: 'String' },
                    { name: 'createdAt', type: 'DateTime' },
                ]
            },
            {
                name: 'DayOff',
                columns: [
                    { name: 'id', type: 'String (UUID)' },
                    { name: 'employeeId', type: 'String (FK)' },
                    { name: 'adminId', type: 'String? (FK)' },
                    { name: 'startDate', type: 'DateTime' },
                    { name: 'endDate', type: 'DateTime' },
                    { name: 'type', type: 'String' },
                    { name: 'reason', type: 'String?' },
                    { name: 'justification', type: 'String?' },
                    { name: 'createdAt', type: 'DateTime' },
                ]
            },
            {
                name: 'Block',
                columns: [
                    { name: 'id', type: 'String (UUID)' },
                    { name: 'employeeId', type: 'String (FK)' },
                    { name: 'adminId', type: 'String (FK)' },
                    { name: 'reason', type: 'String' },
                    { name: 'description', type: 'String?' },
                    { name: 'isActive', type: 'Boolean' },
                    { name: 'unblockReason', type: 'String?' },
                    { name: 'unblockDescription', type: 'String?' },
                    { name: 'unblockedById', type: 'String? (FK)' },
                    { name: 'unblockedAt', type: 'DateTime?' },
                    { name: 'createdAt', type: 'DateTime' },
                ]
            }
        ]

        return res.json({ schema })
    } catch (error) {
        console.error('Error fetching schema:', error)
        return res.status(500).json({ error: 'Failed to fetch database schema' })
    }
}

async function addColumn(req, res) {
    try {
        const superadminPin = req.headers['x-superadmin-pin']

        // Verify superadmin PIN
        if (superadminPin !== '0147') {
            return res.status(403).json({ error: 'Code superadmin incorrect' })
        }

        const { tableName, columnName, columnType, nullable } = req.body

        if (!tableName || !columnName || !columnType) {
            return res.status(400).json({ error: 'Missing required fields: tableName, columnName, columnType' })
        }

        return res.json({
            success: true,
            message: `To add column '${columnName}' of type '${columnType}' to ${tableName}: Update schema.prisma and run: npx prisma migrate dev`,
            instructions: [
                `1. Open prisma/schema.prisma`,
                `2. Add: ${columnName} ${columnType}${nullable ? '?' : ''}`,
                `3. Run: npx prisma migrate dev --name add_${columnName}_to_${tableName.toLowerCase()}`
            ]
        })
    } catch (error) {
        console.error('Error adding column:', error)
        return res.status(500).json({ error: 'Failed to add column' })
    }
}

async function editColumn(req, res) {
    try {
        const superadminPin = req.headers['x-superadmin-pin']

        // Verify superadmin PIN
        if (superadminPin !== '0147') {
            return res.status(403).json({ error: 'Code superadmin incorrect' })
        }

        const { tableName, oldColumnName, newColumnName, newColumnType } = req.body

        if (!tableName || !oldColumnName || !newColumnName || !newColumnType) {
            return res.status(400).json({ error: 'Missing required fields: tableName, oldColumnName, newColumnName, newColumnType' })
        }

        return res.json({
            success: true,
            message: `To rename/modify column '${oldColumnName}' to '${newColumnName}' (${newColumnType}): Update schema.prisma and run: npx prisma migrate dev`,
            instructions: [
                `1. Open prisma/schema.prisma`,
                `2. Find: ${oldColumnName}`,
                `3. Change to: ${newColumnName} ${newColumnType}`,
                `4. Run: npx prisma migrate dev --name rename_${oldColumnName}_to_${newColumnName}`
            ]
        })
    } catch (error) {
        console.error('Error editing column:', error)
        return res.status(500).json({ error: 'Failed to edit column' })
    }
}

async function deleteColumn(req, res) {
    try {
        const superadminPin = req.headers['x-superadmin-pin']

        // Verify superadmin PIN
        if (superadminPin !== '0147') {
            return res.status(403).json({ error: 'Code superadmin incorrect' })
        }

        const { tableName, columnName } = req.body

        if (!tableName || !columnName) {
            return res.status(400).json({ error: 'Missing required fields: tableName, columnName' })
        }

        return res.json({
            success: true,
            message: `To delete column '${columnName}' from ${tableName}: Update schema.prisma and run: npx prisma migrate dev`,
            instructions: [
                `1. Open prisma/schema.prisma`,
                `2. Remove line: ${columnName}`,
                `3. Run: npx prisma migrate dev --name remove_${columnName}_from_${tableName.toLowerCase()}`,
                `⚠️  WARNING: This will permanently delete all data in this column`
            ]
        })
    } catch (error) {
        console.error('Error deleting column:', error)
        return res.status(500).json({ error: 'Failed to delete column' })
    }
}

module.exports = {
    getSchema,
    addColumn,
    editColumn,
    deleteColumn,
}

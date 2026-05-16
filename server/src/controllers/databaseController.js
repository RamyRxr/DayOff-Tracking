const prisma = require('../lib/prisma')

async function getSchema(req, res) {
    try {
        const superadminPin = req.headers['x-superadmin-pin']

        // Verify superadmin PIN
        if (superadminPin !== '0147') {
            return res.status(403).json({ error: 'Code superadmin incorrect' })
        }

        // Get list of tables from PostgreSQL information_schema
        const tables = await prisma.$queryRaw`
            SELECT table_name as name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `

        // Get columns for each table
        const schema = []
        for (const table of tables) {
            const columns = await prisma.$queryRaw`
                SELECT column_name as name,
                       data_type as type,
                       is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = ${table.name}
                ORDER BY ordinal_position
            `

            // Map PostgreSQL types to readable names
            const typeMap = {
                'text': 'String',
                'character varying': 'String',
                'varchar': 'String',
                'integer': 'Int',
                'bigint': 'BigInt',
                'smallint': 'Int',
                'boolean': 'Boolean',
                'timestamp without time zone': 'DateTime',
                'timestamp with time zone': 'DateTime',
                'date': 'Date',
                'time': 'Time',
                'time without time zone': 'Time',
                'double precision': 'Float',
                'real': 'Float',
                'numeric': 'Decimal',
                'jsonb': 'Json',
                'json': 'Json',
                'bytea': 'Bytes'
            }

            schema.push({
                name: table.name,
                columns: columns.map(col => {
                    const baseType = typeMap[col.type.toLowerCase()] || col.type
                    return {
                        name: col.name,
                        type: baseType + (col.is_nullable === 'YES' ? '?' : '')
                    }
                })
            })
        }

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

        // Map Prisma types to PostgreSQL types
        const sqlTypeMap = {
            'String': 'TEXT',
            'Int': 'INTEGER',
            'Integer': 'INTEGER',
            'BigInt': 'BIGINT',
            'Float': 'DOUBLE PRECISION',
            'Decimal': 'NUMERIC',
            'Boolean': 'BOOLEAN',
            'DateTime': 'TIMESTAMP',
            'Date': 'DATE',
            'Time': 'TIME',
            'Json': 'JSONB',
            'Bytes': 'BYTEA'
        }

        const sqlType = sqlTypeMap[columnType] || 'TEXT'
        const nullConstraint = nullable ? '' : ' NOT NULL DEFAULT \'\''

        // Execute raw SQL to add column (PostgreSQL)
        await prisma.$executeRawUnsafe(
            `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${sqlType}${nullConstraint}`
        )

        return res.json({
            success: true,
            message: `Column '${columnName}' added successfully to ${tableName}`
        })
    } catch (error) {
        console.error('Error adding column:', error)
        return res.status(500).json({ error: error.message || 'Failed to add column' })
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

        // Map Prisma types to PostgreSQL types
        const sqlTypeMap = {
            'String': 'TEXT',
            'Int': 'INTEGER',
            'Integer': 'INTEGER',
            'BigInt': 'BIGINT',
            'Float': 'DOUBLE PRECISION',
            'Decimal': 'NUMERIC',
            'Boolean': 'BOOLEAN',
            'DateTime': 'TIMESTAMP',
            'Date': 'DATE',
            'Time': 'TIME',
            'Json': 'JSONB',
            'Bytes': 'BYTEA'
        }

        const sqlType = sqlTypeMap[newColumnType] || 'TEXT'

        // Rename column if name changed
        if (oldColumnName !== newColumnName) {
            await prisma.$executeRawUnsafe(
                `ALTER TABLE "${tableName}" RENAME COLUMN "${oldColumnName}" TO "${newColumnName}"`
            )
        }

        // Change column type (PostgreSQL supports ALTER COLUMN TYPE)
        await prisma.$executeRawUnsafe(
            `ALTER TABLE "${tableName}" ALTER COLUMN "${newColumnName}" TYPE ${sqlType} USING "${newColumnName}"::${sqlType}`
        )

        return res.json({
            success: true,
            message: `Column '${oldColumnName}' updated successfully${oldColumnName !== newColumnName ? ` (renamed to '${newColumnName}')` : ''}`
        })
    } catch (error) {
        console.error('Error editing column:', error)
        return res.status(500).json({ error: error.message || 'Failed to edit column' })
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

        // PostgreSQL supports DROP COLUMN
        await prisma.$executeRawUnsafe(
            `ALTER TABLE "${tableName}" DROP COLUMN "${columnName}"`
        )

        return res.json({
            success: true,
            message: `Column '${columnName}' deleted successfully from ${tableName}`
        })
    } catch (error) {
        console.error('Error deleting column:', error)

        // Handle specific errors
        if (error.message.includes('does not exist')) {
            return res.status(404).json({ error: `Column '${columnName}' does not exist in table ${tableName}` })
        }

        return res.status(500).json({ error: error.message || 'Failed to delete column' })
    }
}

module.exports = {
    getSchema,
    addColumn,
    editColumn,
    deleteColumn,
}

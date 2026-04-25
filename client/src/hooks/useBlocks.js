import { useState, useEffect, useCallback } from 'react'
import { getBlocks, blockEmployee, unblockEmployee } from '../api/blocks'
import { getAdmins } from '../api/admins'

function buildEmployeeName(employee) {
    if (!employee) return ''
    if (employee.name) return employee.name
    return `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
}

function buildAvatar(name) {
    if (!name) return 'NA'
    return name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
}

function mapBlock(block) {
    const employeeName = buildEmployeeName(block.employee)

    return {
        ...block,
        id: String(block.id),
        employeeId: String(block.employeeId),
        blockedAt: block.createdAt,
        blockedBy: {
            name: block.admin?.name || 'Admin RH',
            role: block.admin?.role || '',
        },
        employee: {
            ...block.employee,
            id: String(block.employee?.id || ''),
            name: employeeName,
            avatar: buildAvatar(employeeName),
            daysTotal: 30,
            position: block.employee?.position || '—',
        },
    }
}

async function resolveAdminId(adminId) {
    if (adminId) return String(adminId)

    const response = await getAdmins()
    const firstAdmin = Array.isArray(response?.data) ? response.data[0] : null

    if (!firstAdmin?.id) {
        throw new Error('Aucun administrateur disponible pour cette action')
    }

    return String(firstAdmin.id)
}

/**
 * Hook to fetch and manage blocks
 */
export function useBlocks(activeOnly = true) {
    const [blocks, setBlocks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const refetch = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getBlocks(activeOnly)
            const list = Array.isArray(response?.data) ? response.data.map(mapBlock) : []
            setBlocks(list)
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des blocages')
        } finally {
            setLoading(false)
        }
    }, [activeOnly])

    useEffect(() => {
        refetch()
    }, [refetch])

    const block = async (blockData) => {
        try {
            setError(null)

            const adminId = await resolveAdminId(blockData?.adminId)
            const response = await blockEmployee({
                employeeId: String(blockData.employeeId),
                adminId,
                reason: blockData.reason,
                description: blockData.description || null,
            })

            const created = mapBlock(response.data)
            if (activeOnly) {
                setBlocks((prev) => [created, ...prev])
            }
            return created
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    const unblock = async (blockId, unblockData) => {
        try {
            setError(null)

            const adminId = await resolveAdminId(unblockData?.adminId)
            const response = await unblockEmployee(blockId, {
                adminId,
                unblockReason: unblockData?.reason || unblockData?.unblockReason || null,
                unblockDescription: unblockData?.description || unblockData?.unblockDescription || null,
            })

            const updated = mapBlock(response.data)
            await refetch()
            return updated
        } catch (err) {
            setError(err.message)
            throw err
        }
    }

    return {
        blocks,
        loading,
        error,
        refetch,
        block,
        unblock,
    }
}

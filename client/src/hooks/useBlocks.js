import { useState, useEffect } from 'react'
import { getBlocks, blockEmployee, unblockEmployee } from '../api/blocks'

/**
 * Hook to fetch and manage blocks
 */
export function useBlocks(activeOnly = true) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBlocks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getBlocks(activeOnly)
      setBlocks(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlocks()
  }, [activeOnly])

  const refetch = () => {
    fetchBlocks()
  }

  const block = async (blockData) => {
    try {
      const response = await blockEmployee(blockData)
      setBlocks([response.data, ...blocks])
      return response.data
    } catch (err) {
      throw err
    }
  }

  const unblock = async (blockId, unblockData) => {
    try {
      const response = await unblockEmployee(blockId, unblockData)
      setBlocks(blocks.map((b) => (b.id === blockId ? response.data : b)))
      return response.data
    } catch (err) {
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

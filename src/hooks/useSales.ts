import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSalesStore, SaleWithDetails } from '@/src/stores/salesStore'
import { usePolling } from './usePolling'

export function useSales() {
  const { data: session } = useSession()
  const { sales, loading, setSales, setLoading, updateSale, shouldRefetch, invalidateCache } = useSalesStore()
  const [error, setError] = useState<string | null>(null)

  const fetchSales = useCallback(async (skip: number = 0, limit: number = 50) => {
    try {
      setLoading(true)
      setError(null)
      
      let url = `/api/sales?skip=${skip}&limit=${limit}`
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setSales(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch sales')
      }
    } catch (error) {
      console.error('Failed to fetch sales:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [setSales, setLoading])

  const updateSaleStatus = async (saleId: string, status: string, adminId?: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId, status, adminId, adminNotes })
      })

      if (response.ok) {
        invalidateCache()
        await fetchSales()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update sale:', error)
      return false
    }
  }

  usePolling(fetchSales, { interval: 30000 })

  useEffect(() => {
    if (session?.user && shouldRefetch()) {
      fetchSales()
    }
  }, [session?.user, fetchSales, shouldRefetch])

  return {
    sales,
    loading,
    error,
    fetchSales,
    updateSaleStatus,
  }
}

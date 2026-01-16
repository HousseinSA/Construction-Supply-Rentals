import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSalesStore } from '@/src/stores/salesStore'
import { useSSE } from './useSSE'

export function usePurchases() {
  const { data: session } = useSession()
  const { sales: purchases, loading, setSales, setLoading, shouldRefetch } = useSalesStore()
  const [error, setError] = useState<string | null>(null)

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/sales/my-purchases')
      const data = await response.json()
      if (data.success) {
        setSales(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch purchases')
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [setSales, setLoading])

  useSSE('sales', useCallback(() => {
    fetchPurchases()
  }, [fetchPurchases]))

  useEffect(() => {
    if (session?.user && shouldRefetch()) {
      fetchPurchases()
    }
  }, [session?.user, fetchPurchases, shouldRefetch])

  return {
    purchases,
    loading,
    error,
    fetchPurchases,
  }
}

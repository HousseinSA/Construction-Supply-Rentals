import { useEffect, useCallback } from 'react'
import { useAnalyticsStore } from '@/src/stores/analyticsStore'
import { usePolling } from './usePolling'

export function useAnalytics() {
  const { analytics, loading, setAnalytics, setLoading, shouldRefetch } = useAnalyticsStore()

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [setAnalytics, setLoading])

  usePolling(fetchAnalytics, { interval: 30000 })

  useEffect(() => {
    if (shouldRefetch()) {
      fetchAnalytics()
    }
  }, [fetchAnalytics, shouldRefetch])

  return {
    analytics,
    loading,
    fetchAnalytics,
  }
}

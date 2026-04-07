import { useEffect, useCallback, useRef } from 'react'
import { useAnalyticsStore } from '@/src/stores/analyticsStore'

export function useAnalytics() {
  const { analytics, loading, setAnalytics, setLoading, shouldRefetch } = useAnalyticsStore()
  const hasLoadedRef = useRef(false)

  const fetchAnalytics = useCallback(async () => {
    const isInitialLoad = !hasLoadedRef.current
    try {
      if (isInitialLoad) {
        setLoading(true)
      }
      const response = await fetch('/api/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        hasLoadedRef.current = true
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      if (isInitialLoad) {
        setLoading(false)
      }
    }
  }, [setAnalytics, setLoading])

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

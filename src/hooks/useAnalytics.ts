import { useEffect, useCallback, useRef, useState } from 'react'
import { useAnalyticsStore } from '@/src/stores/analyticsStore'

export function useAnalytics() {
  const { analytics, loading, setAnalytics, setLoading, shouldRefetch } = useAnalyticsStore()
  const hasLoadedRef = useRef(false)
  const [error, setError] = useState<boolean>(false)

  const fetchAnalytics = useCallback(async () => {
    const isInitialLoad = !hasLoadedRef.current
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    try {
      if (isInitialLoad) {
        setLoading(true)
      }
      setError(false)
      const response = await fetch('/api/analytics', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
        hasLoadedRef.current = true
      } else {
        throw new Error('Failed to fetch analytics')
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('Error fetching analytics:', err)
      setError(true) 
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
    error,
    fetchAnalytics,
  }
}

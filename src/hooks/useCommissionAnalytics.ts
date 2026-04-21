import { useEffect, useCallback, useRef } from "react"
import { useCommissionStore } from "@/src/stores/commissionStore"

export function useCommissionAnalytics(dateFilter: string = "last30days") {
  const { commission, loading, error, setCommission, setLoading, setError, shouldRefetch } = useCommissionStore()
  const abortControllerRef = useRef<AbortController | null>(null)
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnalytics = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/analytics/commission?dateFilter=${dateFilter}`, { signal })
      
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch commission analytics")
      }

      const data = await response.json()
      
      if (!signal?.aborted) {
        setCommission(data, dateFilter)
      }
    } catch (err) {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
      
      if (err instanceof Error && err.name === 'AbortError') {
        if (!signal?.aborted) {
          setError("Timeout")
        }
        return
      }
      
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch commission analytics"
      console.error("Error fetching commission analytics:", err)
      
      if (!signal?.aborted) {
        setError(errorMessage)
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [dateFilter, setCommission, setLoading, setError])

  useEffect(() => {
    if (shouldRefetch(dateFilter)) {
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()
      
      timeoutIdRef.current = setTimeout(() => {
        abortControllerRef.current?.abort()
      }, 10000)
      
      fetchAnalytics(abortControllerRef.current.signal)
    }
    
    return () => {
      abortControllerRef.current?.abort()
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }
    }
  }, [dateFilter, fetchAnalytics, shouldRefetch])

  return { 
    analytics: commission, 
    loading,
    error,
    refetch: fetchAnalytics
  }
}

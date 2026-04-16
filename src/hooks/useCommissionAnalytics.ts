import { useEffect, useCallback, useRef } from "react"
import { useCommissionStore } from "@/src/stores/commissionStore"

export function useCommissionAnalytics(dateFilter: string = "last30days") {
  const { commission, loading, setCommission, setLoading, shouldRefetch } = useCommissionStore()
  
  const hasLoadedRef = useRef<Record<string, boolean>>({})

  const fetchAnalytics = useCallback(async () => {
    const isInitialLoad = !hasLoadedRef.current[dateFilter]
    try {
      if (isInitialLoad) {
        setLoading(dateFilter, true)
      }
      
      const response = await fetch(`/api/analytics/commission?dateFilter=${dateFilter}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch commission analytics")
      }

      const data = await response.json()
      setCommission(dateFilter, data)
      hasLoadedRef.current[dateFilter] = true
    } catch (err) {
      console.error("Error fetching commission analytics:", err)
    } finally {
      if (isInitialLoad) {
        setLoading(dateFilter, false)
      }
    }
  }, [dateFilter, setCommission, setLoading])

  useEffect(() => {
    if (shouldRefetch(dateFilter)) {
      fetchAnalytics()
    }
  }, [dateFilter, fetchAnalytics, shouldRefetch])

  return { 
    analytics: commission[dateFilter] || null, 
    loading: loading[dateFilter] || false,
    fetchAnalytics
  }
}

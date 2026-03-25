import { useCallback, useRef, useState } from "react"
import type { FetchResult } from "./types"

interface UseEquipmentFetchOptions {
  onLoadingChange?: (loading: boolean) => void
  skipLoadingOnPolling?: boolean
}

export function useEquipmentFetch(options: UseEquipmentFetchOptions = {}) {
  const { onLoadingChange, skipLoadingOnPolling = true } = options
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialLoadRef = useRef(true)
  const [loading, setLoadingState] = useState(true)

  const setLoading = useCallback((isLoading: boolean) => {
    setLoadingState(isLoading)
    onLoadingChange?.(isLoading)
  }, [onLoadingChange])

  const fetchEquipment = useCallback(
    async (
      params: URLSearchParams,
      options: { isPolling?: boolean; skipCache?: boolean } = {}
    ): Promise<FetchResult | null> => {
      const { isPolling = false, skipCache = false } = options

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const isInitialLoad = initialLoadRef.current
      const shouldShowLoading = isInitialLoad && !(isPolling && skipLoadingOnPolling)

      try {
        if (shouldShowLoading) setLoading(true)

        const response = await fetch(`/api/equipment?${params.toString()}`, {
          cache: "no-store",
          signal: abortControllerRef.current.signal,
        })

        const result = await response.json()

        if (result.success) {
          initialLoadRef.current = false
          return {
            data: result.data || [],
            pagination: result.pagination,
          }
        }

        return null
      } catch (error: any) {
        if (error.name === "AbortError") return null
        console.error("Error fetching equipment:", error)
        return null
      } finally {
        if (shouldShowLoading) setLoading(false)
      }
    },
    [setLoading, skipLoadingOnPolling]
  )

  const abort = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const resetInitialLoad = useCallback(() => {
    initialLoadRef.current = true
  }, [])

  return {
    fetchEquipment,
    loading,
    abort,
    resetInitialLoad,
  }
}

import { useCallback, useRef, useState } from "react"
import type { FetchResult } from "./types"

interface UseEquipmentFetchOptions {
  onLoadingChange?: (loading: boolean) => void
  hasInitialData?: boolean
}

export function useEquipmentFetch(options: UseEquipmentFetchOptions = {}) {
  const { onLoadingChange, hasInitialData = false } = options
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialLoadRef = useRef(true)
  const [loading, setLoadingState] = useState(!hasInitialData)

  const setLoading = useCallback(
    (isLoading: boolean) => {
      setLoadingState(isLoading)
      onLoadingChange?.(isLoading)
    },
    [onLoadingChange],
  )

  const fetchEquipment = useCallback(
    async (
      params: URLSearchParams,
      options: { skipCache?: boolean; shouldRefetch?: () => boolean } = {},
    ): Promise<FetchResult | null> => {
      const { skipCache = false, shouldRefetch } = options
      if (shouldRefetch && !shouldRefetch()) return null
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()
      const timeoutId = setTimeout(
        () => abortControllerRef.current?.abort(),
        10000,
      )

      const isInitialLoad = initialLoadRef.current
      const shouldShowLoading = isInitialLoad || skipCache

      try {
        if (shouldShowLoading) setLoading(true)

        const response = await fetch(`/api/equipment?${params.toString()}`, {
          cache: "no-store",
          signal: abortControllerRef.current.signal,
        })
        clearTimeout(timeoutId)

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
        clearTimeout(timeoutId)
        if (error.name === "AbortError") return null
        console.error("Error fetching equipment:", error)
        return null
      } 
    },
    [setLoading],
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

import { useState, useCallback, useRef, useEffect } from "react"
import { useEquipmentFetch } from "./core"

interface UseInfiniteScrollEquipmentConfig {
  buildParams: (pageNum: number, itemsPerPage: number) => URLSearchParams
  itemsPerPage?: number
  onLoadingChange?: (loading: boolean) => void
  dependencies?: any[]
  initialEquipment?: any[]
  initialHasMore?: boolean
  startFromPage?: number
  shouldRefetch?: () => boolean
  onFetchSuccess?: (equipment: any[], hasMore: boolean) => void
}

export function useInfiniteScrollEquipment({
  buildParams,
  itemsPerPage = 10,
  onLoadingChange,
  dependencies = [],
  initialEquipment = [],
  initialHasMore = false,
  startFromPage = 1,
  shouldRefetch,
  onFetchSuccess,
}: UseInfiniteScrollEquipmentConfig) {
  const [equipment, setEquipment] = useState<any[]>(initialEquipment)
  const [page, setPage] = useState(startFromPage)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasInitialData = initialEquipment.length > 0

  const {
    fetchEquipment: coreFetch,
    loading,
    abort,
  } = useEquipmentFetch({
    onLoadingChange,
    hasInitialData,
  })

  const fetchEquipment = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) {
          setLoadingMore(true)
        }
        setError(null)
        const params = buildParams(pageNum, itemsPerPage)
        const result = await coreFetch(params, { shouldRefetch })

        if (result) {
          const newEquipment = result.data || []
          const newHasMore = result.pagination?.hasMore ?? false
          if (append) {
            setEquipment((prev) => [...prev, ...newEquipment])
          } else {
            setEquipment(newEquipment)
            if (onFetchSuccess && !append) {
              onFetchSuccess(newEquipment, newHasMore)
            }
          }
          setHasMore(newHasMore)
        } else {
          setError("Failed to fetch equipment")
        }
      } catch (error: any) {
        console.error("Failed to fetch equipment:", error)
        setError("Failed to fetch equipment")
      } finally {
        if (append) {
          setLoadingMore(false)
        }
      }
    },
    [buildParams, itemsPerPage, coreFetch, shouldRefetch, onFetchSuccess],
  )

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchEquipment(nextPage, true)
    }
  }, [page, loadingMore, hasMore, fetchEquipment])

  const reset = useCallback(() => {
    setPage(startFromPage)
    setEquipment(initialEquipment)
    setHasMore(initialHasMore)
    setError(null)
  }, [startFromPage, initialEquipment, initialHasMore])

  useEffect(() => {
    if (initialEquipment.length > 0) {
      setEquipment(initialEquipment)
      setHasMore(initialHasMore)
    } else {
      const timer = setTimeout(() => fetchEquipment(startFromPage, false), 0)
      return () => clearTimeout(timer)
    }
  }, dependencies)

  useEffect(() => {
    return () => {
      abort()
    }
  }, [abort])

  return {
    equipment,
    page,
    hasMore,
    loading,
    loadingMore,
    error,
    loadMore,
    reset,
    fetchEquipment,
  }
}

import { useState, useCallback, useRef, useEffect } from "react"
import { useEquipmentFetch } from "./core"

interface UseInfiniteScrollEquipmentConfig {
  buildParams: (pageNum: number, itemsPerPage: number) => URLSearchParams
  itemsPerPage?: number
  onLoadingChange?: (loading: boolean) => void
  dependencies?: any[]
  initialEquipment?: any[]
  startFromPage?: number
  totalPages?: number
}

export function useInfiniteScrollEquipment({
  buildParams,
  itemsPerPage = 10,
  onLoadingChange,
  dependencies = [],
  initialEquipment = [],
  startFromPage = 1,
  totalPages = 1,
}: UseInfiniteScrollEquipmentConfig) {
  const [equipment, setEquipment] = useState<any[]>(initialEquipment)
  const [page, setPage] = useState(startFromPage)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { fetchEquipment: coreFetch, loading, abort } = useEquipmentFetch({
    onLoadingChange,
  })

  const fetchEquipment = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (append) {
          setLoadingMore(true)
        }
        setError(null)

        const params = buildParams(pageNum, itemsPerPage)
        const result = await coreFetch(params)

        if (result) {
          const newEquipment = result.data || []
          if (append) {
            setEquipment(prev => [...prev, ...newEquipment])
          } else {
            setEquipment(newEquipment)
          }
          setHasMore(result.pagination?.hasMore ?? false)
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
    [buildParams, itemsPerPage, coreFetch],
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
    const shouldHaveMore = totalPages > startFromPage || (totalPages === 0 && initialEquipment.length >= itemsPerPage)
    setHasMore(shouldHaveMore)
  }, [startFromPage, initialEquipment, totalPages, itemsPerPage])

  useEffect(() => {
    reset()
    if (initialEquipment.length === 0) {
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

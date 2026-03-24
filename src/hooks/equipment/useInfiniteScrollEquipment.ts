import { useState, useCallback, useRef, useEffect } from "react"

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
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const updateLoading = useCallback((isLoading: boolean) => {
    setLoading(isLoading)
    onLoadingChange?.(isLoading)
  }, [onLoadingChange])

  const fetchEquipment = useCallback(
    async (pageNum: number, append = false) => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
      abortControllerRef.current = new AbortController()

      try {
        if (append) {
          setLoadingMore(true)
        } else {
          updateLoading(true)
        }
        setError(null)

        const params = buildParams(pageNum, itemsPerPage)
        const response = await fetch(`/api/equipment?${params.toString()}`, {
          cache: "no-store",
          signal: abortControllerRef.current.signal,
        })
        const data = await response.json()

        if (data.success) {
          const newEquipment = data.data || []
          if (append) {
            setEquipment(prev => [...prev, ...newEquipment])
          } else {
            setEquipment(newEquipment)
          }
          setHasMore(data.pagination?.hasMore ?? false)
        }
      } catch (error: any) {
        if (error.name === "AbortError") return
        console.error("Failed to fetch equipment:", error)
        setError("Failed to fetch equipment")
      } finally {
        updateLoading(false)
        setLoadingMore(false)
      }
    },
    [buildParams, itemsPerPage, updateLoading],
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
    updateLoading(initialEquipment.length === 0) 
    const shouldHaveMore = totalPages > startFromPage || (totalPages === 0 && initialEquipment.length >= itemsPerPage)
    setHasMore(shouldHaveMore)
  }, [startFromPage, initialEquipment, totalPages, itemsPerPage, updateLoading])

  useEffect(() => {
    reset()
    if (initialEquipment.length === 0) {
      const timer = setTimeout(() => fetchEquipment(startFromPage, false), 0)
      return () => clearTimeout(timer)
    }
  }, dependencies)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

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

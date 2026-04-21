import { useState, useEffect, useCallback, useRef } from "react"

interface UseServerTableDataConfig<T> {
  endpoint: string
  itemsPerPage?: number
  additionalParams?: Record<string, string>
  transformResponse?: (data: any) => T[]
  shouldRefetch?: () => boolean
  onStatsUpdate?: (stats: any) => void
  invalidateCache?: () => void
}

export function useServerTableData<T>({
  endpoint,
  itemsPerPage = 10,
  additionalParams = {},
  transformResponse,
  shouldRefetch,
  onStatsUpdate,
  invalidateCache,
}: UseServerTableDataConfig<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(() =>
    shouldRefetch ? shouldRefetch() : true,
  )
  const [error, setError] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState("")
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})
  const [stats, setStats] = useState<any>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()
    const timeoutId = setTimeout(
      () => abortControllerRef.current?.abort(),
      10000,
    )

    const needsRefetch = shouldRefetch ? shouldRefetch() : true
    if (!needsRefetch) {
      clearTimeout(timeoutId)
      return
    }
    try {
      setLoading(true)
      setError(false)
      const params = new URLSearchParams()
      params.set("page", currentPage.toString())
      params.set("limit", itemsPerPage.toString())

      if (searchValue.trim()) {
        params.set("search", searchValue.trim())
      }

      Object.entries(filterValues).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.set(key, value)
        }
      })

      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value) {
          params.set(key, value)
        }
      })

      const url = `${endpoint}?${params.toString()}`
      const response = await fetch(url, {
        cache: "no-store",
        signal: abortControllerRef.current.signal,
      })
      clearTimeout(timeoutId)

      const result = await response.json()
      if (result.success) {
        const transformedData = transformResponse
          ? transformResponse(result.data)
          : result.data || []
        setData(transformedData)

        if (result.pagination) {
          setTotalPages(result.pagination.totalPages)
          setTotalCount(result.pagination.totalCount)
        }

        if (result.stats) {
          setStats(result.stats)
          if (onStatsUpdate) {
            onStatsUpdate(result.stats)
          }
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        setError(true)
        return
      }
      console.error(`Error fetching data from ${endpoint}:`, error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [
    endpoint,
    currentPage,
    itemsPerPage,
    searchValue,
    filterValues,
    additionalParams,
    transformResponse,
    shouldRefetch,
    onStatsUpdate,
  ])

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }))
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
      if (invalidateCache && value !== "all") {
        invalidateCache()
      }
    },
    [currentPage, invalidateCache],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
      if (invalidateCache) {
        invalidateCache()
      }
    },
    [currentPage, invalidateCache],
  )

  const resetFilters = useCallback(() => {
    setSearchValue("")
    setFilterValues({})
    setCurrentPage(1)
  }, [])

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchData()
    }, 500)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchValue, filterValues, currentPage])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    searchValue,
    setSearchValue: handleSearchChange,
    filterValues,
    handleFilterChange,
    currentPage,
    totalPages,
    goToPage: setCurrentPage,
    totalItems: totalCount,
    itemsPerPage,
    refetch: fetchData,
    stats,
    resetFilters,
  }
}

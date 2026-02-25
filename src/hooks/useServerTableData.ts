import { useState, useEffect, useCallback, useRef } from "react"
import { usePolling } from "./usePolling"

interface UseServerTableDataConfig<T> {
  endpoint: string
  itemsPerPage?: number
  additionalParams?: Record<string, string>
  pollingInterval?: number
  transformResponse?: (data: any) => T[]
}

export function useServerTableData<T>({
  endpoint,
  itemsPerPage = 10,
  additionalParams = {},
  pollingInterval = 30000,
  transformResponse,
}: UseServerTableDataConfig<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
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

    try {
      setLoading(true)
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
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return
      console.error(`Error fetching data from ${endpoint}:`, error)
    } finally {
      setLoading(false)
    }
  }, [endpoint, currentPage, itemsPerPage, searchValue, filterValues, additionalParams, transformResponse])

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }))
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
    },
    [currentPage]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
    },
    [currentPage]
  )

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

  usePolling(fetchData, { interval: pollingInterval })

  return {
    data,
    loading,
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
  }
}

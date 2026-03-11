import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { usePolling } from "./usePolling"
import { buildEquipmentQueryParams } from "@/src/lib/equipment-query-params"
import { useInfiniteScrollEquipment } from "./useInfiniteScrollEquipment"

interface UseManageEquipmentConfig {
  convertToLocalized: (location: string) => string
  supplierId?: string
  onPricingReview?: (item: any) => void
}

interface LocationOption {
  value: string
  label: string
}

interface FilterValues {
  status: string
  listingType: string
  availability: string
  location: string
  [key: string]: string
}

const ITEMS_PER_PAGE = 10
const POLLING_INTERVAL = 20000
const DEBOUNCE_DELAY = 500

export function useManageEquipment({
  convertToLocalized,
  supplierId,
  onPricingReview,
}: UseManageEquipmentConfig) {
  const {
    equipment,
    loading,
    updating,
    currentPage,
    setEquipment,
    setLoading,
    setCurrentPage,
    invalidateCache,
    setIsSupplier,
    setConvertToLocalized,
    setOnPricingReview,
  } = useEquipmentStore()

  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchValue, setSearchValue] = useState("")
  const [filterValues, setFilterValues] = useState<FilterValues>({
    status: "all",
    listingType: "all",
    availability: "all",
    location: "all",
  })
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [isMobile, setIsMobile] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)
  const fetchEquipmentRef = useRef<(skipCache?: boolean) => Promise<void>>(async () => {})

  const mobileInfiniteScroll = useInfiniteScrollEquipment({
    buildParams: (pageNum: number, itemsPerPage: number) => {
      return buildEquipmentQueryParams(pageNum, itemsPerPage, supplierId, searchValue, filterValues)
    },
    itemsPerPage: ITEMS_PER_PAGE,
    dependencies: [supplierId, searchValue, filterValues],
    initialEquipment: equipment,
    startFromPage: 1,
    totalPages: totalPages
  })

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/equipment/locations")
      const data = await response.json()
      if (data.success) {
        setLocations(data.data.map((loc: string) => ({ value: loc, label: loc })))
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }, [])

  const fetchEquipment = useCallback(
    async (skipCache = false, isPolling = false) => {
      if (abortControllerRef.current) abortControllerRef.current.abort()
      abortControllerRef.current = new AbortController()
      const params = buildEquipmentQueryParams(
        currentPage,
        ITEMS_PER_PAGE,
        supplierId,
        searchValue,
        filterValues,
      )
      const queryString = params.toString()
      const isInitialLoad = initialLoadRef.current
      const shouldFetch = skipCache || useEquipmentStore.getState().shouldRefetch(queryString)
      
      if (!shouldFetch) {
        if (isInitialLoad) {
          initialLoadRef.current = false
        }
        return
      }
      
      const hasData = useEquipmentStore.getState().equipment.length > 0
      const shouldShowLoading = (isInitialLoad && !hasData) && !isPolling
      
      try {
        if (shouldShowLoading) setLoading(true)

        const response = await fetch(`/api/equipment?${queryString}`, {
          cache: "no-store",
          signal: abortControllerRef.current.signal,
        })
        const data = await response.json()

        if (data.success) {
          setEquipment(data.data || [], queryString)
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages)
            setTotalCount(data.pagination.totalCount)
          }
          initialLoadRef.current = false
        }
      } catch (error: any) {
        if (error.name === "AbortError") return
        console.error("Error fetching equipment:", error)
      } finally {
        if (shouldShowLoading) setLoading(false)
      }
    },
    [setEquipment, setLoading, supplierId, currentPage, searchValue, filterValues],
  )

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }))
      setCurrentPage(1)
      invalidateCache(true)
    },
    [invalidateCache],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      setCurrentPage(1)
      invalidateCache(true)
    },
    [invalidateCache],
  )
  const refetch = useCallback(() => {
    invalidateCache()
    return fetchEquipment(true)
  }, [invalidateCache, fetchEquipment])

  const localizedLocations = useMemo(
    () => locations.map((loc) => ({ value: loc.value, label: convertToLocalized(loc.label) })),
    [locations, convertToLocalized],
  )


  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1280
      if (mobile !== isMobile) {
        setIsMobile(mobile)
        if (mobile && currentPage > 1) {
          setCurrentPage(1)
        }
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isMobile, currentPage])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  useEffect(() => {
    setIsSupplier(!!supplierId)
    setConvertToLocalized(convertToLocalized)
    if (onPricingReview) setOnPricingReview(onPricingReview)
  }, [supplierId, convertToLocalized, onPricingReview, setIsSupplier, setConvertToLocalized, setOnPricingReview])

  useEffect(() => {
    fetchEquipmentRef.current = fetchEquipment
  }, [fetchEquipment])

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      fetchEquipmentRef.current(true)
    }, DEBOUNCE_DELAY)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [searchValue, filterValues, currentPage, supplierId])

  usePolling(() => fetchEquipment(true, true), { 
    interval: POLLING_INTERVAL,
    enabled: typeof window !== 'undefined' && window.location.pathname.includes('/dashboard/equipment') && !mobileInfiniteScroll.loadingMore
  })

  return {
    equipment,
    loading,
    updating,
    refetch,
    searchValue,
    setSearchValue: handleSearchChange,
    filterValues,
    handleFilterChange,
    locations: localizedLocations,
    currentPage,
    totalPages,
    goToPage: setCurrentPage,
    totalItems: totalCount,
    itemsPerPage: ITEMS_PER_PAGE,
    mobileEquipment: mobileInfiniteScroll.equipment,
    loadingMoreMobile: mobileInfiniteScroll.loadingMore,
    hasMoreMobile: mobileInfiniteScroll.hasMore,
    loadMoreMobile: mobileInfiniteScroll.loadMore,
  }
}
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { usePolling } from "./usePolling"

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
}

function buildQueryParams(
  currentPage: number,
  itemsPerPage: number,
  supplierId: string | undefined,
  searchValue: string,
  filterValues: FilterValues,
) {
  const params = new URLSearchParams()
  params.set("page", currentPage.toString())
  params.set("limit", itemsPerPage.toString())
  params.set("includeSupplier", "true")

  if (supplierId) {
    params.set("supplierId", supplierId)
  } else {
    params.set("admin", "true")
  }

  if (searchValue.trim()) {
    params.set("search", searchValue.trim())
  }

  if (filterValues.status !== "all") {
    if (filterValues.status === "pendingPricing") {
      params.set("hasPendingPricing", "true")
    } else {
      params.set("status", filterValues.status)
    }
  }

  if (filterValues.listingType !== "all") {
    params.set("listingType", filterValues.listingType)
  }

  if (filterValues.availability === "available") {
    params.set("available", "true")
  } else if (filterValues.availability === "unavailable") {
    params.set("available", "false")
    params.set("excludeSold", "true")
  } else if (filterValues.availability === "sold") {
    params.set("available", "false")
    params.set("listingType", "forSale")
  }

  if (filterValues.location !== "all") {
    params.set("city", filterValues.location)
  }
  return params
}

export function useManageEquipment({
  convertToLocalized,
  supplierId,
  onPricingReview,
}: UseManageEquipmentConfig) {
  const {
    equipment,
    loading,
    updating,
    setEquipment,
    setLoading,
    invalidateCache,
    shouldRefetch,
    setIsSupplier,
    setConvertToLocalized,
    setOnPricingReview,
  } = useEquipmentStore()

  const [currentPage, setCurrentPage] = useState(1)
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

  const itemsPerPage = 10
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)
  const fetchEquipmentRef = useRef<(skipCache?: boolean) => Promise<void>>(async () => {})

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/equipment/locations")
      const data = await response.json()
      if (data.success) {
        setLocations(
          data.data.map((loc: string) => ({
            value: loc,
            label: loc,
          })),
        )
      }
    } catch (error) {
      console.error("Error fetching locations:", error)
    }
  }, [])

  const fetchEquipment = useCallback(
    async (skipCache = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      const shouldFetch = skipCache || useEquipmentStore.getState().shouldRefetch()
      if (!shouldFetch) {
        initialLoadRef.current = false
        return
      }

      const isInitialLoad = initialLoadRef.current
      try {
        if (isInitialLoad) {
          setLoading(true)
        }

        const params = buildQueryParams(
          currentPage,
          itemsPerPage,
          supplierId,
          searchValue,
          filterValues,
        )
        const response = await fetch(`/api/equipment?${params.toString()}`, {
          cache: "no-store",
          signal: abortControllerRef.current.signal,
        })
        const data = await response.json()

        if (data.success) {
          setEquipment(data.data || [])
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
        if (isInitialLoad) {
          setLoading(false)
        }
      }
    },
    [
      setEquipment,
      setLoading,
      supplierId,
      currentPage,
      searchValue,
      filterValues,
    ],
  )

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }))
      setCurrentPage(1)
      invalidateCache()
    },
    [invalidateCache],
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      setCurrentPage(1)
      invalidateCache()
    },
    [invalidateCache],
  )

  const refetch = useCallback(() => {
    invalidateCache()
    return fetchEquipment(true)
  }, [invalidateCache, fetchEquipment])

  useEffect(() => {
    fetchLocations()
  }, [])

  const localizedLocations = useMemo(
    () =>
      locations.map((loc) => ({
        value: loc.value,
        label: convertToLocalized(loc.label),
      })),
    [locations, convertToLocalized],
  )

  useEffect(() => {
    setIsSupplier(!!supplierId)
    setConvertToLocalized(convertToLocalized)
    if (onPricingReview) setOnPricingReview(onPricingReview)
  }, [supplierId, convertToLocalized, onPricingReview])

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
      fetchEquipmentRef.current()
    }, 500)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [searchValue, filterValues, currentPage, supplierId])

  const pollingInterval = 20000
  usePolling(() => fetchEquipment(true), { interval: pollingInterval })

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
    itemsPerPage,
  }
}

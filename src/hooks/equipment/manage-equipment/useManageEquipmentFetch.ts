import { useCallback, useRef } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { buildEquipmentQueryParams } from "@/src/lib/equipment-query-params"

interface FilterValues {
  status: string
  listingType: string
  availability: string
  location: string
  [key: string]: string
}

const ITEMS_PER_PAGE = 12

export function useManageEquipmentFetch(
  currentPage: number,
  supplierId: string | undefined,
  searchValue: string,
  filterValues: FilterValues,
  setTotalPages: (pages: number) => void,
  setTotalCount: (count: number) => void,
) {
  const { setEquipment, setLoading } = useEquipmentStore()
  const abortControllerRef = useRef<AbortController | null>(null)
  const initialLoadRef = useRef(true)

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch("/api/equipment/locations")
      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error("Error fetching locations:", error)
      return []
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
    [setEquipment, setLoading, setTotalPages, setTotalCount, currentPage, supplierId, searchValue, filterValues],
  )

  return {
    fetchLocations,
    fetchEquipment,
    abortControllerRef,
    initialLoadRef,
  }
}

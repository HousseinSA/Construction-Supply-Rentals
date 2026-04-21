import { useCallback, useRef } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { buildEquipmentQueryParams, EQUIPMENT_ITEMS_PER_PAGE } from "@/src/lib/equipment-query-params"
import { useEquipmentFetch } from "../core"

interface FilterValues {
  status: string
  listingType: string
  availability: string
  location: string
  [key: string]: string
}

export function useManageEquipmentFetch(
  currentPage: number,
  supplierId: string | undefined,
  searchValue: string,
  filterValues: FilterValues,
  setTotalPages: (pages: number) => void,
  setTotalCount: (count: number) => void,
) {
  const { setEquipment, shouldRefetch, setError } = useEquipmentStore()
  const queryStringRef = useRef<string>("")

  const { fetchEquipment: coreFetch } = useEquipmentFetch({
    onLoadingChange: (loading) => {
      useEquipmentStore.getState().setLoading(loading)
    },
  })

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
    async (skipCache = false) => {
      const params = buildEquipmentQueryParams(
        currentPage,
        EQUIPMENT_ITEMS_PER_PAGE,
        supplierId,
        searchValue,
        filterValues,
      )
      const queryString = params.toString()
      queryStringRef.current = queryString

      if (!skipCache && !shouldRefetch(queryString)) {
        return
      }

      if (skipCache) {
        useEquipmentStore.getState().setLoading(true)
      }
      setError(false)
      
      const result = await coreFetch(params, { skipCache })
      if (result) {
        setEquipment(result.data, queryString)
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages)
          setTotalCount(result.pagination.totalCount)
        }
        useEquipmentStore.getState().setLoading(false)
      } else {
        setError(true)
        useEquipmentStore.getState().setLoading(false)
      }
    },
    [coreFetch, setEquipment, setError, setTotalPages, setTotalCount, currentPage, supplierId, searchValue, filterValues, shouldRefetch],
  )

  return {
    fetchLocations,
    fetchEquipment,
  }
}

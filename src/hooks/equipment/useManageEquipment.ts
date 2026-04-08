import { useCallback, useMemo } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { buildEquipmentQueryParams, EQUIPMENT_ITEMS_PER_PAGE } from "@/src/lib/equipment-query-params"
import { useInfiniteScrollEquipment } from "./useInfiniteScrollEquipment"
import {
  useManageEquipmentState,
  useManageEquipmentHandlers,
  useManageEquipmentFetch,
  useManageEquipmentEffects,
} from "./manage-equipment"

interface UseManageEquipmentConfig {
  convertToLocalized: (location: string) => string
  supplierId?: string
}

export function useManageEquipment({
  convertToLocalized,
  supplierId,
}: UseManageEquipmentConfig) {
const loading = useEquipmentStore((state) => state.loading)
const updating = useEquipmentStore((state) => state.updating)
const invalidateCache = useEquipmentStore((state) => state.invalidateCache)

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalCount,
    setTotalCount,
    searchValue,
    setSearchValue,
    filterValues,
    setFilterValues,
    locations,
    setLocations,
    isMobile,
    setIsMobile,
  } = useManageEquipmentState()

  const { handleFilterChange, handleSearchChange } = useManageEquipmentHandlers(
    setFilterValues,
    setSearchValue,
    setCurrentPage,
    invalidateCache,
    
  )

  const { fetchLocations, fetchEquipment } = useManageEquipmentFetch(
    currentPage,
    supplierId,
    searchValue,
    filterValues,
    setTotalPages,
    setTotalCount,
  )

  const mobileInfiniteScroll = useInfiniteScrollEquipment({
    buildParams: (pageNum: number, itemsPerPage: number) => {
      return buildEquipmentQueryParams(pageNum, itemsPerPage, supplierId, searchValue, filterValues)
    },
    itemsPerPage: EQUIPMENT_ITEMS_PER_PAGE,
    dependencies: [supplierId, searchValue, filterValues],
    initialEquipment: [],
    startFromPage: 1,
    totalPages: totalPages,
  })

  useManageEquipmentEffects(
    fetchLocations,
    fetchEquipment,
    setLocations,
    isMobile,
    setIsMobile,
    currentPage,
    setCurrentPage,
    searchValue,
    filterValues,
    supplierId,
    convertToLocalized,
    mobileInfiniteScroll,
  )

  const refetch = useCallback(() => {
    invalidateCache()
    return fetchEquipment(true)
  }, [invalidateCache, fetchEquipment])

  return {
    loading,
    updating,
    refetch,
    searchValue,
    setSearchValue: handleSearchChange,
    filterValues,
    handleFilterChange,
    locations,
    currentPage,
    totalPages,
    goToPage: setCurrentPage,
    totalItems: totalCount,
    itemsPerPage: EQUIPMENT_ITEMS_PER_PAGE,
    mobileEquipment: mobileInfiniteScroll.equipment,
    loadingMoreMobile: mobileInfiniteScroll.loadingMore,
    hasMoreMobile: mobileInfiniteScroll.hasMore,
    loadMoreMobile: mobileInfiniteScroll.loadMore,
  }
}

import { useCallback, useMemo } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { buildEquipmentQueryParams } from "@/src/lib/equipment-query-params"
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
  onPricingReview?: (item: any) => void
}

const ITEMS_PER_PAGE = 12

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
    setCurrentPage,
    invalidateCache,
  } = useEquipmentStore()

  const {
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
    itemsPerPage: ITEMS_PER_PAGE,
    dependencies: [supplierId, searchValue, filterValues],
    initialEquipment: equipment,
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
    onPricingReview,
    mobileInfiniteScroll,
  )

  const refetch = useCallback(() => {
    invalidateCache()
    return fetchEquipment(true)
  }, [invalidateCache, fetchEquipment])

  const localizedLocations = useMemo(
    () => locations.map((loc) => ({ value: loc.value, label: convertToLocalized(loc.label) })),
    [locations, convertToLocalized],
  )

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

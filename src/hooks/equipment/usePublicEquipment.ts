import {  useCallback } from "react"
import { useInfiniteScrollEquipment } from "./useInfiniteScrollEquipment"
import { EQUIPMENT_ITEMS_PER_PAGE } from "@/src/lib/equipment-query-params"
import { useEquipmentStore } from "@/src/stores/equipmentStore"

function buildPublicEquipmentParams(
  page: number,
  selectedCity?: string | null,
  selectedType?: string | null,
  listingType?: string | null
): URLSearchParams {
  const params = new URLSearchParams()
  params.set("available", "true")
  params.set("page", page.toString())
  params.set("limit", EQUIPMENT_ITEMS_PER_PAGE.toString())
  if (selectedCity && listingType !== "forSale") {
    params.set("city", selectedCity)
    params.set("listingType", "forRent")
  }
  if (selectedType) {
    params.set("type", selectedType)
  }
  if (listingType) {
    params.set("listingType", listingType)
  }

  return params 
}

export function usePublicEquipment(
  selectedCity?: string | null,
  selectedType?: string | null,
  listingType?: string | null
) {
  const { shouldRefetch, invalidateCache, setPublicEquipment, getPublicEquipment } = useEquipmentStore()

  const buildQueryKey = useCallback(() => {
    const params = buildPublicEquipmentParams(1, selectedCity, selectedType, listingType)
    return params.toString()
  }, [selectedCity, selectedType, listingType])

  const queryKey = buildQueryKey()
  const cached = getPublicEquipment(queryKey)
  const cachedEquipment = cached.equipment
  const cachedHasMore = cached.hasMore

  const buildParams = useCallback(
    (pageNum: number) => buildPublicEquipmentParams(pageNum, selectedCity, selectedType, listingType),
    [selectedCity, selectedType, listingType]
  )

  const mobileInfiniteScroll = useInfiniteScrollEquipment({
    buildParams,
    itemsPerPage: EQUIPMENT_ITEMS_PER_PAGE,
    dependencies: [selectedCity, selectedType, listingType],
    initialEquipment: cachedEquipment,
    initialHasMore: cachedHasMore,
    startFromPage: 1,
    shouldRefetch: () => shouldRefetch(queryKey),
    onFetchSuccess: (equipment, hasMore) => setPublicEquipment(equipment, queryKey, hasMore), })

  const refetch = useCallback(() => {
    invalidateCache()
    mobileInfiniteScroll.reset()
    mobileInfiniteScroll.fetchEquipment(1, false)
  }, [mobileInfiniteScroll, invalidateCache])

  return {
    loading: mobileInfiniteScroll.loading,
    error: mobileInfiniteScroll.error,
    equipment: mobileInfiniteScroll.equipment,
    loadingMore: mobileInfiniteScroll.loadingMore,
    hasMore: mobileInfiniteScroll.hasMore,
    loadMore: mobileInfiniteScroll.loadMore,
    refetch,
  }
}

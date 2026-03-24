import { useEffect, useCallback, useMemo } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { useInfiniteScrollEquipment } from "./useInfiniteScrollEquipment"
import { EQUIPMENT_ITEMS_PER_PAGE } from "@/src/lib/equipment-query-params"

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
  const { setPublicEquipment, getPublicEquipment } = useEquipmentStore()

  const queryKey = useMemo(() => {
    return buildPublicEquipmentParams(1, selectedCity, selectedType, listingType).toString()
  }, [selectedCity, selectedType, listingType])

  const cachedEquipment = getPublicEquipment(queryKey) || []

  const buildParams = useCallback(
    (pageNum: number) => buildPublicEquipmentParams(pageNum, selectedCity, selectedType, listingType),
    [selectedCity, selectedType, listingType]
  )

  const mobileInfiniteScroll = useInfiniteScrollEquipment({
    buildParams,
    itemsPerPage: EQUIPMENT_ITEMS_PER_PAGE,
    dependencies: [selectedCity, selectedType, listingType],
    initialEquipment: cachedEquipment,
    startFromPage: 1,
  })

  useEffect(() => {
    if (!mobileInfiniteScroll.loading && mobileInfiniteScroll.equipment.length > 0) {
      setPublicEquipment(queryKey, mobileInfiniteScroll.equipment)
    }
  }, [
    queryKey,
    mobileInfiniteScroll.loading,
    mobileInfiniteScroll.equipment,
    setPublicEquipment,
  ])

  const refetch = useCallback(() => {
    mobileInfiniteScroll.reset()
    mobileInfiniteScroll.fetchEquipment(1, false)
  }, [])

  return {
    loading: mobileInfiniteScroll.loading,
    equipment: mobileInfiniteScroll.equipment,
    loadingMore: mobileInfiniteScroll.loadingMore,
    hasMore: mobileInfiniteScroll.hasMore,
    loadMore: mobileInfiniteScroll.loadMore,
    refetch,
  }
}

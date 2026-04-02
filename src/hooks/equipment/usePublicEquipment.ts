import { useEffect, useCallback, useMemo, useState, useRef } from "react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { useInfiniteScrollEquipment } from "./useInfiniteScrollEquipment"
import { EQUIPMENT_ITEMS_PER_PAGE } from "@/src/lib/equipment-query-params"
import { useEquipmentCache, useEquipmentSSE } from "./core"

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
  const { setPublicEquipment, getPublicEquipment, shouldRefetchPublic } = useEquipmentStore()
  const [initialFetchDone, setInitialFetchDone] = useState(false)
  const lastCachedLength = useRef(0)

  const queryKey = useMemo(() => {
    return buildPublicEquipmentParams(1, selectedCity, selectedType, listingType).toString()
  }, [selectedCity, selectedType, listingType])

  const { cachedData, updateCache } = useEquipmentCache({
    cacheKey: queryKey,
    getCached: getPublicEquipment,
    setCached: (key, data) => setPublicEquipment(key, data, 'api'),
    shouldRefetch: shouldRefetchPublic,
  })

  const shouldFetch = useMemo(() => {
    if (!initialFetchDone && !cachedData) return true
    if (shouldRefetchPublic(queryKey)) return true
    return false
  }, [initialFetchDone, cachedData, queryKey, shouldRefetchPublic])

  const buildParams = useCallback(
    (pageNum: number) => buildPublicEquipmentParams(pageNum, selectedCity, selectedType, listingType),
    [selectedCity, selectedType, listingType]
  )

  const mobileInfiniteScroll = useInfiniteScrollEquipment({
    buildParams,
    itemsPerPage: EQUIPMENT_ITEMS_PER_PAGE,
    dependencies: [selectedCity, selectedType, listingType],
    initialEquipment: cachedData,
    startFromPage: 1,
  })

  useEquipmentSSE({ 
    enabled: true,
    onUpdate: () => {
      if (!mobileInfiniteScroll.loading) {
        mobileInfiniteScroll.fetchEquipment(1, false)
      }
    }
  })

  useEffect(() => {
    if (shouldFetch && !mobileInfiniteScroll.loading) {
      mobileInfiniteScroll.fetchEquipment(1, false)
      setInitialFetchDone(true)
    }
  }, [shouldFetch])

  useEffect(() => {
    const currentLength = mobileInfiniteScroll.equipment.length
    if (!mobileInfiniteScroll.loading && currentLength > 0 && currentLength !== lastCachedLength.current) {
      lastCachedLength.current = currentLength
      updateCache(mobileInfiniteScroll.equipment)
    }
  }, [mobileInfiniteScroll.loading, mobileInfiniteScroll.equipment, updateCache])

  const refetch = useCallback(() => {
    mobileInfiniteScroll.reset()
    mobileInfiniteScroll.fetchEquipment(1, false)
  }, [mobileInfiniteScroll])

  return {
    loading: mobileInfiniteScroll.loading,
    equipment: mobileInfiniteScroll.equipment,
    loadingMore: mobileInfiniteScroll.loadingMore,
    hasMore: mobileInfiniteScroll.hasMore,
    loadMore: mobileInfiniteScroll.loadMore,
    refetch,
  }
}

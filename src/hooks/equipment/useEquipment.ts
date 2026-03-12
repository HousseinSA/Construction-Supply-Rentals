import { useCallback } from "react"
import { useInfiniteScrollEquipment } from "./useInfiniteScrollEquipment"

export function useEquipment(
  selectedCity?: string | null,
  selectedType?: string | null,
  listingType?: string | null,
) {
  const buildParams = useCallback((pageNum: number, itemsPerPage: number) => {
    const params = new URLSearchParams()
    params.set("available", "true")
    params.set("page", pageNum.toString())
    params.set("limit", itemsPerPage.toString())

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
  }, [selectedCity, selectedType, listingType])

  return useInfiniteScrollEquipment({
    buildParams,
    itemsPerPage: 10,
    dependencies: [selectedCity, selectedType, listingType],
  })
}

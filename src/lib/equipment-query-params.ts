export const EQUIPMENT_ITEMS_PER_PAGE = 12
export const CACHE_DURATION = 1 * 60 * 1000

interface FilterValues {
  status: string
  listingType: string
  availability: string
  location: string
}

export function buildEquipmentQueryParams(
  currentPage: number,
  itemsPerPage: number,
  supplierId: string | undefined,
  searchValue: string,
  filterValues: FilterValues,
): URLSearchParams {
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
    params.set("isSold", "true")
  }
  if (filterValues.location !== "all") {
    params.set("city", filterValues.location)
  }
  return params
}

import { ObjectId, Filter } from "mongodb"
import type { Db } from "mongodb"
import type { Equipment } from "@/src/lib/models/equipment"
import type { EquipmentStatus } from "@/src/lib/types"

const EXCLUDED_CATEGORY_IDS = [
  new ObjectId("68f9fa232008e59cb126784b"),
  new ObjectId("68f9fa232008e59cb126784c"),
]

export interface EquipmentQueryParams {
  status?: string | null
  categoryId?: string | null
  type?: string | null
  city?: string | null
  listingType?: string | null
  availableOnly?: boolean
  isAdmin?: boolean
  supplierId?: string | null
  search?: string | null
  hasPendingPricing?: string | null
  excludeSold?: string | null
  isSold?: string | null
}

function applyDefaultFilters(query: Filter<Equipment>, isAdmin?: boolean, supplierId?: string | null) {
  if (!isAdmin && !supplierId) {
    query.status = "approved"
    query.isAvailable = true
  }
}

function applySupplierFilter(query: Filter<Equipment>, supplierId?: string | null) {
  if (supplierId && ObjectId.isValid(supplierId)) {
    query.supplierId = new ObjectId(supplierId)
  }
}

function applyStatusFilter(query: Filter<Equipment>, status?: string | null) {
  if (status) {
    query.status = status as EquipmentStatus
  }
}

function applyCategoryFilter(query: Filter<Equipment>, categoryId?: string | null) {
  if (categoryId) {
    query.categoryId = new ObjectId(categoryId)
  }
}

function applyTypeFilter(query: Filter<Equipment>, type?: string | null) {
  if (type) {
    query.equipmentTypeId = new ObjectId(type)
  }
}

function applyAvailabilityFilters(
  query: Filter<Equipment>,
  availableOnly?: boolean,
  isSold?: string | null,
  excludeSold?: string | null
) {
  if (availableOnly === true) {
    query.isAvailable = true
  }

  if (isSold === "true") {
    query.isSold = true
  } else if (availableOnly === false) {
    query.isAvailable = false
    if (excludeSold === "true") {
      query.$or = [
        { isSold: { $exists: false } },
        { isSold: false }
      ]
    }
  }
}

function applyPendingPricingFilter(query: Filter<Equipment>, hasPendingPricing?: string | null) {
  if (hasPendingPricing === "true") {
    query.pendingPricing = { $exists: true, $ne: null }
  }
}

function applyCityFilter(query: Filter<Equipment>, city?: string | null) {
  if (city) {
    query.location = { $regex: new RegExp(city, "i") }
  }
}

function applyListingTypeFilter(query: Filter<Equipment>, listingType?: string | null) {
  if (listingType) {
    query.listingType = listingType as "forSale" | "forRent"
  }
}

export async function buildEquipmentQuery(
  db: Db,
  params: EquipmentQueryParams,
): Promise<Filter<Equipment>> {
  const {
    status,
    categoryId,
    type,
    city,
    listingType,
    availableOnly,
    isAdmin,
    supplierId,
    hasPendingPricing,
    excludeSold,
    isSold,
  } = params

  const query: Filter<Equipment> = {
    categoryId: { $nin: EXCLUDED_CATEGORY_IDS },
  }

  applyDefaultFilters(query, isAdmin, supplierId)
  applySupplierFilter(query, supplierId)
  applyStatusFilter(query, status)
  applyCategoryFilter(query, categoryId)
  applyTypeFilter(query, type)
  applyAvailabilityFilters(query, availableOnly, isSold, excludeSold)
  applyPendingPricingFilter(query, hasPendingPricing)
  applyCityFilter(query, city)
  applyListingTypeFilter(query, listingType)

  return query
}

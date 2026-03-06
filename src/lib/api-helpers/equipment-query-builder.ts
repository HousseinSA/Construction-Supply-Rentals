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
  category?: string | null
  type?: string | null
  city?: string | null
  listingType?: string | null
  availableOnly?: boolean
  isAdmin?: boolean
  supplierId?: string | null
  search?: string | null
  hasPendingPricing?: string | null
  excludeSold?: string | null
}

export async function buildEquipmentQuery(
  db: Db,
  params: EquipmentQueryParams,
): Promise<Filter<Equipment>> {
  const {
    status,
    categoryId,
    category,
    type,
    city,
    listingType,
    availableOnly,
    isAdmin,
    supplierId,
    search,
    hasPendingPricing,
    excludeSold,
  } = params

  const query: Filter<Equipment> = {
    categoryId: { $nin: EXCLUDED_CATEGORY_IDS },
  }

  if (!isAdmin && !supplierId) {
    query.status = "approved"
    query.isAvailable = true
  }

  if (supplierId && ObjectId.isValid(supplierId)) {
    query.supplierId = new ObjectId(supplierId)
  }

  if (status) {
    query.status = status as EquipmentStatus
  }

  if (categoryId) {
    query.categoryId = new ObjectId(categoryId)
  }

  if (type) {
    query.equipmentTypeId = new ObjectId(type)
  }

  if (availableOnly) {
    query.isAvailable = true
  }

  if (hasPendingPricing === "true") {
    query.pendingPricing = { $exists: true, $ne: null }
  }

  if (availableOnly === false || params.availableOnly === false) {
    query.isAvailable = false
    if (excludeSold === "true") {
      query.listingType = { $ne: "forSale" }
    }
  }

  if (city && listingType !== "forSale") {
    query.location = { $regex: new RegExp(city, "i") }
  }

  if ((city || type) && !listingType) {
    query.listingType = "forRent"
  } else if (listingType) {
    query.listingType = listingType as "forSale" | "forRent"
  }

  if (category) {
    const categoryDoc = await db.collection("categories").findOne({
      $or: [
        { name: { $regex: new RegExp(category.replace(/-/g, " "), "i") } },
        { name: { $regex: new RegExp(category, "i") } },
      ],
    })
    if (categoryDoc) {
      query.categoryId = categoryDoc._id
    }
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i")
    query.$or = [
      { name: searchRegex },
      { location: searchRegex },
      { description: searchRegex },
      { referenceNumber: searchRegex }
    ]
  }

  return query
}

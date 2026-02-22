import { ObjectId } from "mongodb"
import type { Db } from "mongodb"

let cachedExcludedCategoryIds: ObjectId[] | null = null

export async function getExcludedCategoryIds(db: Db): Promise<ObjectId[]> {
  if (cachedExcludedCategoryIds) {
    return cachedExcludedCategoryIds
  }

  const excludedCategories = [
    "Engins spécialisés",
    "Engins légers et auxiliaires",
  ]
  const excludedCategoryDocs = await db
    .collection("categories")
    .find({ name: { $in: excludedCategories } })
    .project({ _id: 1 })
    .toArray()

  cachedExcludedCategoryIds = excludedCategoryDocs.map((cat) => cat._id)
  return cachedExcludedCategoryIds
}

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
): Promise<any> {
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

  const excludedCategoryIds = await getExcludedCategoryIds(db)
  const query: any = {
    categoryId: { $nin: excludedCategoryIds },
  }

  if (!isAdmin && !supplierId) {
    query.status = "approved"
    query.isAvailable = true
  }

  if (supplierId && ObjectId.isValid(supplierId)) {
    query.supplierId = new ObjectId(supplierId)
  }

  if (status) {
    query.status = status
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
    query.listingType = listingType
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

import { ObjectId } from "mongodb"
import type { Db } from "mongodb"
import { errorResponse } from "./validation-helpers"
import { getUsageCategoryFromEquipmentType, getInitialEquipmentStatus } from '@/src/lib/models/equipment'
import type {
  Equipment,
  EquipmentQuery,
  CreateEquipmentBody,
  EquipmentType,
  AuthContext,
  FetchEquipmentOptions,
  PaginationResult,
  ValidationResult
} from './types'

const MAX_IMAGES = 10
const COLLECTION_NAME = "equipment"

const buildPagination = (page: number, limit: number, totalCount: number) => ({
  page,
  limit,
  totalCount,
  totalPages: Math.ceil(totalCount / limit)
})

async function fetchWithPagination(
  db: Db,
  query: EquipmentQuery,
  skip: number,
  limit: number
) {
  const collection = db.collection<Equipment>(COLLECTION_NAME)
  const [equipment, totalCount] = await Promise.all([
    collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    collection.countDocuments(query)
  ])
  return { equipment, totalCount }
}

async function fetchWithSupplierAggregation(
  db: Db,
  query: EquipmentQuery,
  skip: number,
  limit: number
) {
  const collection = db.collection<Equipment>(COLLECTION_NAME)
  const pipeline = [
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "supplierId",
        foreignField: "_id",
        as: "supplier",
        pipeline: [{ $project: { password: 0 } }]
      }
    },
    {
      $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true }
    },
    {
      $addFields: {
        supplier: {
          $cond: [{ $eq: ["$createdBy", "supplier"] }, "$supplier", null]
        }
      }
    }
  ]

  const [equipment, totalCount] = await Promise.all([
    collection.aggregate<Equipment>(pipeline).toArray(),
    collection.countDocuments(query)
  ])

  return { equipment, totalCount }
}

export async function fetchEquipmentWithPagination(
  db: Db,
  query: EquipmentQuery,
  options: FetchEquipmentOptions
): Promise<PaginationResult> {
  const { page, limit, includeSupplier, isAdmin } = options
  const skip = (page - 1) * limit

  const { equipment, totalCount } = (isAdmin && includeSupplier)
    ? await fetchWithSupplierAggregation(db, query, skip, limit)
    : await fetchWithPagination(db, query, skip, limit)

  return {
    equipment,
    pagination: buildPagination(page, limit, totalCount)
  }
}

export async function enrichEquipmentWithBookingStatus(db: Db, equipment: Equipment[]) {
  if (equipment.length === 0) return equipment

  const { getBatchBookingStatus } = await import('./index')
  const equipmentIds: ObjectId[] = []
  
  for (const item of equipment) {
    if (item._id) equipmentIds.push(item._id as ObjectId)
  }
  
  const bookingStatusMap = await getBatchBookingStatus(db, equipmentIds)

  return equipment.map((item) => {
    const defaultStatus = {
      hasActiveBookings: false,
      hasPendingSale: false
    }
    const status = item._id ? (bookingStatusMap.get(item._id.toString()) || defaultStatus) : defaultStatus
    return { ...item, ...status }
  })
}

export function validateEquipmentCreation(body: CreateEquipmentBody): ValidationResult {
  const { categoryId, equipmentTypeId, pricing, location, images, specifications, listingType } = body

  const validations = [
    {
      condition: !categoryId || !equipmentTypeId || !pricing || !location,
      message: "Missing required fields: categoryId, equipmentTypeId, pricing, location"
    },
    {
      condition: listingType === "forSale" && !specifications?.condition,
      message: "Condition is required for sale equipment"
    },
    {
      condition: !images || !Array.isArray(images) || images.length === 0,
      message: "At least one image is required"
    },
    {
      condition: images?.length > MAX_IMAGES,
      message: `Maximum ${MAX_IMAGES} images allowed`
    }
  ]

  for (const { condition, message } of validations) {
    if (condition) return { valid: false, error: errorResponse(message, 400) }
  }

  return { valid: true }
}

export function buildEquipmentDocument(
  body: CreateEquipmentBody,
  auth: AuthContext,
  equipmentType: EquipmentType,
  referenceNumber: string
) {
  const usageCategory = getUsageCategoryFromEquipmentType(equipmentType.name)
  const status = getInitialEquipmentStatus(auth.role as "admin" | "user")
  const createdBy = auth.role === "admin" || auth.userType !== "supplier" ? "admin" : "supplier"

  return {
    referenceNumber,
    supplierId: ObjectId.createFromHexString(auth.id),
    name: equipmentType.name,
    description: body.description ?? "",
    categoryId: ObjectId.createFromHexString(body.categoryId),
    equipmentTypeId: ObjectId.createFromHexString(body.equipmentTypeId),
    pricing: body.pricing,
    location: body.location,
    images: body.images,
    specifications: body.specifications ?? {},
    usage: body.usage ?? {},
    usageCategory,
    status,
    isAvailable: true,
    listingType: body.listingType ?? "forRent",
    createdBy,
    createdById: ObjectId.createFromHexString(auth.id),
    ...(status === "approved" && { approvedAt: new Date() }),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

import { ObjectId } from "mongodb"
import { EquipmentStatus, UsageCategory, PricingType } from "../types"

export interface Equipment {
  _id?: ObjectId | string
  referenceNumber?: string
  supplierId?: ObjectId | string
  name: string 
  description: string
  categoryId: ObjectId | string
  equipmentTypeId: ObjectId | string
  pricing: {
    type: PricingType
    hourlyRate?: number
    dailyRate?: number
    monthlyRate?: number
    kmRate?: number
    tonRate?: number
    salePrice?: number
  }
  pendingPricing?: {
    hourlyRate?: number
    dailyRate?: number
    monthlyRate?: number
    kmRate?: number
    tonRate?: number
    salePrice?: number
    requestedAt?: Date
  }
  location: string
  images: string[]
  specifications?: {
    condition?: string
    brand?: string
    model?: string
    year?: number
    hoursUsed?: number
    kilometersUsed?: number
    tonnageUsed?: number
    weight?: number
    weightUnit?: string 
  }
  usageCategory: UsageCategory
  status: EquipmentStatus
  rejectionReason?: string
  rejectedAt?: Date
  lastEditedAt?: Date
  pricingRejectionReason?: string
  isAvailable: boolean
  isSold?: boolean
  listingType: "forSale" | "forRent"
  createdBy: "admin" | "supplier"
  createdById: ObjectId | string
  approvedBy?: ObjectId | string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export function getUsageCategoryFromEquipmentType(
  equipmentTypeName: string
): UsageCategory {
  const lowerName = equipmentTypeName.toLowerCase()

  if (
    lowerName.includes("porte-char") ||
    lowerName.includes("porte-engin") ||
    lowerName.includes("portechar") ||
    lowerName.includes("porteengin")
  ) {
    return "kilometers"
  }

  if (
    lowerName.includes("camion benne") ||
    lowerName.includes("camionbenne") ||
    lowerName.includes("benne")
  ) {
    return "tonnage"
  }

  return "hours"
}

export function getInitialEquipmentStatus(
  creatorRole: "admin" | "user"
): EquipmentStatus {
  return creatorRole === "admin" ? "approved" : "pending"
}

export const LOCKED_FIELDS = [
  'name',
  'equipmentTypeId',
  'categoryId',
  'listingType',
  'location',
  'usageCategory',
  'createdBy',
  'createdById'
] as const

export const SUPPLIER_EDITABLE_FIELDS = [
  'description',
  'images',
  'specifications'
] as const

export function canEditEquipment(
  equipment: Equipment,
  userRole: "admin" | "user",
  userId: string
): { canEdit: boolean; reason?: string } {
  if (userRole === "admin") {
    return { canEdit: true }
  }

  if (equipment.supplierId?.toString() !== userId) {
    return { canEdit: false, reason: "You don't own this equipment" }
  }

  if (equipment.status === "rejected") {
    return { canEdit: false, reason: "Cannot edit rejected equipment" }
  }

  if (equipment.status === "sold" || equipment.isSold) {
    return { canEdit: false, reason: "Cannot edit sold equipment" }
  }

  return { canEdit: true }
}

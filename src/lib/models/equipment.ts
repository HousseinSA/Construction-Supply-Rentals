import { ObjectId } from "mongodb"
import { EquipmentStatus, UsageCategory, PricingType } from "../types"

export interface Equipment {
  _id?: ObjectId
  supplierId?: ObjectId
  name: string // Auto-generated from equipment type
  description: string
  categoryId: ObjectId
  equipmentTypeId: ObjectId
  pricing: {
    type: PricingType
    hourlyRate?: number
    dailyRate?: number
    kmRate?: number
    tonRate?: number
    salePrice?: number
  }
  location: string
  images: string[]
  specifications?: {
    condition?: string // new, excellent, good, fair, used
    brand?: string
    model?: string
    hoursUsed?: number
    weight?: number
    weightUnit?: string // kg or tons
  }
  usageCategory: UsageCategory // Auto-determined by equipment category
  status: EquipmentStatus
  isAvailable: boolean
  listingType: "forSale" | "forRent"
  createdBy: "admin" | "supplier"
  createdById: ObjectId
  approvedBy?: ObjectId
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
  creatorRole: "admin" | "supplier"
): EquipmentStatus {
  return creatorRole === "admin" ? "approved" : "pending"
}

import { ObjectId } from "mongodb"
import { EquipmentStatus, UsageCategory, PricingType } from "../types"

export interface Equipment {
  _id?: ObjectId
  supplierId?: ObjectId
  name: string 
  description: string
  categoryId: ObjectId
  equipmentTypeId: ObjectId
  pricing: {
    type: PricingType
    hourlyRate?: number
    dailyRate?: number
    monthlyRate?: number
    kmRate?: number
    tonRate?: number
    salePrice?: number
  }
  location: string
  images: string[]
  specifications?: {
    condition?: string
    brand?: string
    model?: string
    hoursUsed?: number
    kilometersUsed?: number
    tonnageUsed?: number
    weight?: number
    weightUnit?: string 
  }
  usageCategory: UsageCategory
  status: EquipmentStatus
  isAvailable: boolean
  isSold?: boolean
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
  creatorRole: "admin" | "user"
): EquipmentStatus {
  return creatorRole === "admin" ? "approved" : "pending"
}

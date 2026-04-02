import { ObjectId } from "mongodb"
import { EquipmentStatus, UsageCategory, PricingType } from "../types"
import { User } from "./user"

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
  } | null
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
    usageUnit?: string 
    weight?: number
    weightUnit?: string
  }
  usageCategory: UsageCategory
  status: EquipmentStatus
  rejectionReason?: string | null
  rejectedAt?: Date | null
  lastEditedAt?: Date
  pricingRejectionReasons?: {
    [key: string]: string
  } | null
  rejectedPricingValues?: {
    hourlyRate?: number
    dailyRate?: number
    monthlyRate?: number
    kmRate?: number
    tonRate?: number
    salePrice?: number
  } | null
  isAvailable: boolean
  isSold?: boolean
  listingType: "forSale" | "forRent"
  createdBy: "admin" | "supplier"
  approvedBy?: ObjectId | string
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface EquipmentWithSupplier extends Equipment {
  supplier?: User
  hasActiveBookings?: boolean
  hasPendingSale?: boolean
}

export function getUsageCategoryFromEquipmentType(
  equipmentTypeName: string,
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
  creatorRole: "admin" | "user",
): EquipmentStatus {
  return creatorRole === "admin" ? "approved" : "pending"
}

export const LOCKED_FIELDS = [
  "name",
  "equipmentTypeId",
  "categoryId",
  "listingType",
  "location",
  "usageCategory",
  "createdBy",
] as const

export const LOCKED_FIELDS_FOR_EDIT = [
  "categoryId",
  "equipmentTypeId",
  "location",
  "listingType",
  "usageCategory",
] as const

export const SUPPLIER_EDITABLE_FIELDS = [
  "description",
  "images",
  "specifications",
] as const


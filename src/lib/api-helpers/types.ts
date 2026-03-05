import { ObjectId } from "mongodb"
import type { Filter } from "mongodb"
import { NextResponse } from "next/server"
import type { Equipment as EquipmentModel } from "@/src/lib/models/equipment"
import type { EquipmentType as EquipmentTypeModel } from "@/src/lib/models/category"

export type Equipment = EquipmentModel
export type EquipmentType = EquipmentTypeModel

export type EquipmentQuery = Filter<Equipment>

export interface CreateEquipmentBody {
  categoryId: string
  equipmentTypeId: string
  pricing: Record<string, unknown>
  location: Record<string, unknown>
  images: string[]
  specifications?: { condition?: string; [key: string]: unknown }
  listingType?: string
  description?: string
  usage?: Record<string, unknown>
}

export interface AuthContext {
  id: string
  role: string
  userType: string
}

export interface FetchEquipmentOptions {
  page: number
  limit: number
  includeSupplier?: boolean
  isAdmin: boolean
}

export interface PaginationResult {
  equipment: Equipment[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export interface ValidationResult {
  valid: boolean
  error?: NextResponse
}

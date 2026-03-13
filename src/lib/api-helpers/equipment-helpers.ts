import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import type { Db } from "mongodb"
import { connectDB } from "@/src/lib/mongodb"
import { getAuthenticatedUser } from "./auth-helpers"
import { validateObjectId, errorResponse } from "./validation-helpers"
import type { Equipment } from "@/src/lib/models/equipment"
import type { User } from "@/src/lib/models/user"

export async function checkEquipmentOwnership(
  db: Db,
  equipmentId: string,
  userId: string,
  isAdmin: boolean
): Promise<{ authorized: boolean; equipment?: Equipment; error?: NextResponse }> {
  const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(equipmentId) }) as Equipment | null

  if (!equipment) {
    return {
      authorized: false,
      error: errorResponse("Equipment not found", 404)
    }
  }

  if (!isAdmin && equipment.supplierId?.toString() !== userId) {
    return {
      authorized: false,
      error: errorResponse("You don't own this equipment", 403)
    }
  }

  return { authorized: true, equipment }
}

export async function validateAndGetEquipmentAccess(equipmentId: string, checkOwnership: boolean = true) {
  const auth = await getAuthenticatedUser()
  if (!auth.authenticated) return { error: auth.error }

  const idValidation = validateObjectId(equipmentId, "equipment ID")
  if (!idValidation.valid) return { error: idValidation.error }

  const db = await connectDB()
  const isAdmin = auth.user!.role === "admin"
  const userId = auth.user!.id

  if (checkOwnership) {
    const ownership = await checkEquipmentOwnership(db, equipmentId, userId, isAdmin)
    if (!ownership.authorized) return { error: ownership.error }

    return {
      db,
      equipment: ownership.equipment!,
      isAdmin,
      userId,
    }
  }

  const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(equipmentId) }) as Equipment | null

  if (!equipment) {
    return { error: errorResponse("Equipment not found", 404) }
  }

  return {
    db,
    equipment,
    isAdmin,
    userId,
  }
}

type PricingFields = "hourlyRate" | "dailyRate" | "monthlyRate" | "kmRate" | "tonRate" | "salePrice"

export function formatPricing(pricing: Equipment['pricing'], listingType?: string): string {
  if (listingType === "forSale" && pricing.salePrice) {
    return `${pricing.salePrice.toFixed(2)} MRU`
  }

  const parts: string[] = []
  if (pricing.hourlyRate) parts.push(`${pricing.hourlyRate} MRU/h`)
  if (pricing.dailyRate) parts.push(`${pricing.dailyRate} MRU/jour`)
  if (pricing.monthlyRate) parts.push(`${pricing.monthlyRate} MRU/mois`)
  if (pricing.kmRate) parts.push(`${pricing.kmRate} MRU/km`)
  if (pricing.tonRate) parts.push(`${pricing.tonRate} MRU/tonne`)
  if (pricing.salePrice) parts.push(`${pricing.salePrice} MRU`)

  return parts.join(", ") || "-"
}

export function detectPricingChanges(
  currentPricing: Equipment['pricing'],
  newPricing: Partial<Equipment['pricing']>
): { changedPricing: Record<PricingFields, number>; hasChanges: boolean } {
  const changedPricing: Record<string, number> = {}
  let hasChanges = false

  const priceFields: PricingFields[] = ["hourlyRate", "dailyRate", "monthlyRate", "kmRate", "tonRate", "salePrice"]

  priceFields.forEach((field) => {
    const newValue = newPricing[field]
    const currentValue = currentPricing[field]

    if (newValue !== undefined && newValue !== currentValue) {
      changedPricing[field] = newValue
      hasChanges = true
    }
  })

  return { changedPricing: changedPricing as Record<PricingFields, number>, hasChanges }
}

export async function getSupplierInfo(db: Db, supplierId: ObjectId): Promise<User | null> {
  return await db.collection("users").findOne(
    { _id: supplierId },
    { projection: { password: 0 } }
  ) as User | null
}

export async function getAdminUser(db: Db): Promise<User | null> {
  return await db.collection("users").findOne({ role: "admin" }) as User | null
}

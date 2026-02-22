import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { ObjectId } from "mongodb"
import type { Db } from "mongodb"

// ============================================
// RESPONSE HELPERS
// ============================================

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

export function errorResponse(error: string, status = 500) {
  return NextResponse.json({ success: false, error }, { status })
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function validateObjectId(id: string, fieldName = "ID"): { valid: boolean; error?: NextResponse } {
  if (!ObjectId.isValid(id)) {
    return {
      valid: false,
      error: errorResponse(`Invalid ${fieldName}`, 400)
    }
  }
  return { valid: true }
}

export function validateObjectIds(ids: Record<string, string>): { valid: boolean; error?: NextResponse } {
  for (const [fieldName, id] of Object.entries(ids)) {
    const result = validateObjectId(id, fieldName)
    if (!result.valid) return result
  }
  return { valid: true }
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      authenticated: false,
      error: errorResponse("Authentication required", 401)
    }
  }

  return {
    authenticated: true,
    user: {
      id: session.user.id,
      role: session.user.role || "user",
      userType: session.user.userType || "supplier"
    }
  }
}

export async function requireAdmin() {
  const auth = await getAuthenticatedUser()
  
  if (!auth.authenticated) {
    return { authorized: false, error: auth.error }
  }

  if (auth.user!.role !== "admin") {
    return {
      authorized: false,
      error: errorResponse("Unauthorized - Admin only", 401)
    }
  }

  return { authorized: true, user: auth.user }
}

// ============================================
// OWNERSHIP HELPERS
// ============================================

export async function checkEquipmentOwnership(
  db: Db,
  equipmentId: string,
  userId: string,
  isAdmin: boolean
): Promise<{ authorized: boolean; equipment?: any; error?: NextResponse }> {
  const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(equipmentId) })

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

// ============================================
// BOOKING STATUS HELPERS
// ============================================

export async function checkActiveBookingsOrSales(
  db: Db,
  equipmentId: ObjectId
): Promise<{ hasActiveBookings: boolean; hasPendingSale: boolean }> {
  const [hasActiveBookings, hasPendingSale] = await Promise.all([
    db.collection("bookings").findOne({
      "bookingItems.equipmentId": equipmentId,
      status: { $in: ["pending", "paid"] }
    }),
    db.collection("sales").findOne({
      equipmentId: equipmentId,
      status: { $in: ["pending", "paid"] }
    })
  ])

  return {
    hasActiveBookings: !!hasActiveBookings,
    hasPendingSale: !!hasPendingSale
  }
}

export async function getBookingStatusForEquipment(
  db: Db,
  equipmentId: string,
  userId?: string
): Promise<{
  userBookingStatus: string | null
  hasPendingBookings: boolean
  hasActiveBookings: boolean
}> {
  const now = new Date()
  const equipmentObjectId = new ObjectId(equipmentId)

  const queries: Promise<any>[] = [
    db.collection("bookings").findOne({
      "bookingItems.equipmentId": equipmentObjectId,
      status: "pending",
      startDate: { $lte: now },
      endDate: { $gte: now }
    }),
    db.collection("bookings").findOne({
      "bookingItems.equipmentId": equipmentObjectId,
      status: { $in: ["pending", "paid"] },
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
  ]

  let userBookingStatus = null
  if (userId) {
    queries.push(
      db.collection("bookings").findOne({
        renterId: new ObjectId(userId),
        "bookingItems.equipmentId": equipmentObjectId,
        status: "pending"
      })
    )
  }

  const results = await Promise.all(queries)
  const [hasPendingBookings, hasActiveBookings, userBooking] = results

  if (userBooking) {
    userBookingStatus = "pending"
  }

  return {
    userBookingStatus,
    hasPendingBookings: !!hasPendingBookings,
    hasActiveBookings: !!hasActiveBookings
  }
}

// ============================================
// PRICING HELPERS
// ============================================

export function formatPricing(pricing: any, listingType?: string): string {
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
  currentPricing: any,
  newPricing: any
): { changedPricing: any; hasChanges: boolean } {
  const changedPricing: any = {}
  let hasChanges = false

  const priceFields = ["hourlyRate", "dailyRate", "monthlyRate", "kmRate", "tonRate", "salePrice"]

  priceFields.forEach((field) => {
    const newValue = newPricing[field]
    const currentValue = currentPricing[field]

    if (newValue !== undefined && newValue !== currentValue) {
      changedPricing[field] = newValue
      hasChanges = true
    }
  })

  return { changedPricing, hasChanges }
}

// ============================================
// USER LOOKUP HELPERS
// ============================================

export async function getSupplierInfo(db: Db, supplierId: ObjectId) {
  return await db.collection("users").findOne(
    { _id: supplierId },
    { projection: { password: 0 } }
  )
}

export async function getAdminUser(db: Db) {
  return await db.collection("users").findOne({ role: "admin" })
}

// ============================================
// BATCH BOOKING STATUS HELPER (FIX N+1)
// ============================================

export async function getBatchBookingStatus(
  db: Db,
  equipmentIds: ObjectId[]
): Promise<Map<string, { hasActiveBookings: boolean; hasPendingSale: boolean }>> {
  if (equipmentIds.length === 0) {
    return new Map()
  }

  const [activeBookings, pendingSales] = await Promise.all([
    db.collection("bookings").find({
      "bookingItems.equipmentId": { $in: equipmentIds },
      status: { $in: ["pending", "paid"] }
    }).toArray(),
    db.collection("sales").find({
      equipmentId: { $in: equipmentIds },
      status: { $in: ["pending", "paid"] }
    }).toArray()
  ])

  const statusMap = new Map<string, { hasActiveBookings: boolean; hasPendingSale: boolean }>()

  equipmentIds.forEach(id => {
    const idStr = id.toString()
    const hasActiveBookings = activeBookings.some(booking =>
      booking.bookingItems?.some((item: any) => item.equipmentId?.toString() === idStr)
    )
    const hasPendingSale = pendingSales.some(sale => sale.equipmentId?.toString() === idStr)
    
    statusMap.set(idStr, { hasActiveBookings, hasPendingSale })
  })

  return statusMap
}

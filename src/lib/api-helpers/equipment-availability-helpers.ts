import { ObjectId } from "mongodb"
import type { Db } from "mongodb"
import type { Booking, BookingItem } from "@/src/lib/models/booking"
import type { SaleOrder } from "@/src/lib/models/sale"

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

  const queries = [
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

  if (userId) {
    queries.push(
      db.collection("bookings").findOne({
        renterId: new ObjectId(userId),
        "bookingItems.equipmentId": equipmentObjectId,
        status: "pending"
      })
    )
  }

  const results = await Promise.all(queries) as (Booking | null)[]
  const [hasPendingBookings, hasActiveBookings, userBooking] = results

  return {
    userBookingStatus: userBooking ? "pending" : null,
    hasPendingBookings: !!hasPendingBookings,
    hasActiveBookings: !!hasActiveBookings
  }
}

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
    }).toArray() as Promise<Booking[]>,
    db.collection("sales").find({
      equipmentId: { $in: equipmentIds },
      status: { $in: ["pending", "paid"] }
    }).toArray() as Promise<SaleOrder[]>
  ])

  const statusMap = new Map<string, { hasActiveBookings: boolean; hasPendingSale: boolean }>()

  equipmentIds.forEach(id => {
    const idStr = id.toString()
    const hasActiveBookings = activeBookings.some(booking =>
      booking.bookingItems?.some((item: BookingItem) => item.equipmentId?.toString() === idStr)
    )
    const hasPendingSale = pendingSales.some(sale => sale.equipmentId?.toString() === idStr)
    
    statusMap.set(idStr, { hasActiveBookings, hasPendingSale })
  })

  return statusMap
}

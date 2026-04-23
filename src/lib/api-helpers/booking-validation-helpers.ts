import type { Db } from "mongodb"
import { ObjectId } from "mongodb"
import { checkEquipmentAvailability, getConflictingBooking } from "@/src/lib/booking-utils"
import { formatBookingDate } from "@/src/lib/format"

export async function validateBookingAvailability(
  db: Db,
  equipmentId: ObjectId,
  startDate?: Date,
  endDate?: Date
): Promise<{ available: boolean; error?: string; conflictingDates?: { startDate: Date; endDate: Date } }> {
  const available = await checkEquipmentAvailability(db, equipmentId, startDate, endDate)
  
  if (available) {
    return { available: true }
  }

  const conflictingBooking = await getConflictingBooking(db, equipmentId, startDate, endDate)
  const equipment = await db.collection("equipment").findOne({ _id: equipmentId })

  const startDateStr = formatBookingDate(conflictingBooking?.startDate)
  const endDateStr = formatBookingDate(conflictingBooking?.endDate)

  return {
    available: false,
    error: `Equipment ${equipment?.name} is already booked for ${startDateStr} - ${endDateStr}. Please select different dates.`,
    conflictingDates: conflictingBooking
      ? {
          startDate: conflictingBooking.startDate,
          endDate: conflictingBooking.endDate,
        }
      : undefined,
  }
}

import type { Db } from "mongodb"
import { ObjectId } from "mongodb"
import type { BookingItem } from "@/src/lib/models/booking"

export async function sendBookingCreatedNotification(
  db: Db,
  booking: {
    referenceNumber: string
    renterId: ObjectId
    bookingItems: BookingItem[]
    totalPrice: number
    commission: number
    startDate?: Date
    endDate?: Date
    equipmentReferenceNumber?: string
  }
) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  try {
    const renter = await db.collection("users").findOne({ _id: booking.renterId })
    const firstItem = booking.bookingItems[0]
    
    let supplierName = "admin"
    let supplierPhone = ""
    if (firstItem.supplierId) {
      const supplier = await db.collection("users").findOne({ _id: firstItem.supplierId })
      if (supplier) {
        supplierName = `${supplier.firstName} ${supplier.lastName}`
        supplierPhone = supplier.phone || ""
      }
    }

    const { sendNewBookingEmail } = await import("@/src/lib/email")
    await sendNewBookingEmail(adminEmail, {
      referenceNumber: booking.referenceNumber,
      equipmentName: firstItem.equipmentName,
      equipmentReference: booking.equipmentReferenceNumber,
      totalPrice: booking.totalPrice,
      commission: booking.commission,
      renterName: renter ? `${renter.firstName} ${renter.lastName}` : "Unknown",
      renterPhone: renter?.phone || "N/A",
      supplierName,
      supplierPhone,
      usage: firstItem.usage,
      usageUnit: firstItem.usageUnit || "hours",
      rate: firstItem.rate,
      startDate: booking.startDate,
      endDate: booking.endDate,
      bookingDate: new Date(),
    })
  } catch (err) {
    console.error("Email error:", err)
  }
}

export async function sendBookingCancelledByRenterNotification(
  db: Db,
  booking: {
    referenceNumber: string
    renterId: ObjectId
    bookingItems: Array<{ equipmentName: string }>
  }
) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  try {
    const renter = await db.collection("users").findOne({ _id: booking.renterId })
    const firstItem = booking.bookingItems[0]

    const { sendBookingCancellationEmail } = await import("@/src/lib/email")
    await sendBookingCancellationEmail(adminEmail, {
      referenceNumber: booking.referenceNumber,
      equipmentNames: [firstItem?.equipmentName || "N/A"],
      totalPrice: 0,
      renterName: renter ? `${renter.firstName} ${renter.lastName}` : "Unknown",
      renterPhone: renter?.phone || "N/A",
      suppliers: [],
      createdAt: new Date(),
      cancellationDate: new Date(),
    })
  } catch (err) {
    console.error("Email error:", err)
  }
}

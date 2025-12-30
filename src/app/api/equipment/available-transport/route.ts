import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await connectDB()

    const unavailableBookings = await db.collection("bookings").find({ status: { $in: ["pending", "paid"] } }).toArray()
    const pendingSales = await db.collection("sales").find({ status: "pending" }).toArray()
    const manuallyUnavailableEquipment = await db.collection("equipment").find({ isAvailable: false }).toArray()

    const unavailableEquipmentIds = [
      ...unavailableBookings.flatMap((b: any) => b.bookingItems.map((item: any) => item.equipmentId)),
      ...pendingSales.map((s: any) => s.equipmentId),
      ...manuallyUnavailableEquipment.map(e => e._id)
    ].map(id => new ObjectId(id))
    
    const equipment = await db
      .collection("equipment")
      .find({
        _id: { $nin: unavailableEquipmentIds },
        name: { $regex: /porte-char|porte char/i },
        status: "approved",
        isAvailable: true,
        listingType: "forRent"
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      equipment,
    })
  } catch (error) {
    console.error("Error fetching transport equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transport equipment" },
      { status: 500 }
    )
  }
}

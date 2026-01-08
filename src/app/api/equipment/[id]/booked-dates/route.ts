import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipmentId = params.id

    if (!ObjectId.isValid(equipmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    
    const bookings = await db
      .collection("bookings")
      .find({
        "bookingItems.equipmentId": new ObjectId(equipmentId),
        status: { $in: ["pending", "paid"] },
        startDate: { $exists: true },
        endDate: { $exists: true }
      })
      .project({ startDate: 1, endDate: 1 })
      .toArray()

    const bookedRanges = bookings.map(booking => ({
      start: booking.startDate,
      end: booking.endDate
    }))

    return NextResponse.json({
      success: true,
      data: bookedRanges
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch booked dates" },
      { status: 500 }
    )
  }
}

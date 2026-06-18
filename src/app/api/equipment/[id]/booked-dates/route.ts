import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: equipmentId } = await params

    if (!ObjectId.isValid(equipmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    
    const equipment = await db
      .collection("equipment")
      .findOne(
        { _id: new ObjectId(equipmentId) },
        { projection: { listingType: 1, status: 1 } }
      )

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 }
      )
    }

    if (equipment.listingType === "forSale") {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    const bookings = await db
      .collection("bookings")
      .find({
        "bookingItems.equipmentId": new ObjectId(equipmentId),
        status: { $in: ["pending", "paid"] },
        startDate: { $exists: true },
        endDate: { $exists: true }
      })
      .project({ 
        startDate: 1, 
        endDate: 1, 
        referenceNumber: 1,
        status: 1 
      })
      .sort({ startDate: 1 })
      .toArray()

    const bookedRanges = bookings.map(booking => ({
      start: booking.startDate,
      end: booking.endDate,
      reference: booking.referenceNumber,
      status: booking.status
    }))

    return NextResponse.json(
      {
        success: true,
        data: bookedRanges
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
      }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch booked dates" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { triggerRealtimeUpdate } from "@/src/lib/realtime-trigger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get("admin") === "true"

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const query: any = { _id: new ObjectId(id) }
    if (!isAdmin) {
      query.status = "approved"
    }

    const equipment = await db.collection("equipment").findOne(query)

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 }
      )
    }

    // Fetch supplier info if admin is viewing
    let supplierInfo = null
    if (isAdmin && equipment.supplierId) {
      supplierInfo = await db.collection("users").findOne(
        { _id: equipment.supplierId },
        { projection: { password: 0 } }
      )
    }

    // Check for pending bookings for this equipment
    const session = await getServerSession(authOptions)
    let userBookingStatus = null
    
    if (session?.user?.id) {
      const pendingBooking = await db.collection("bookings").findOne({
        renterId: new ObjectId(session.user.id),
        "bookingItems.equipmentId": new ObjectId(id),
        status: "pending"
      })
      
      if (pendingBooking) {
        userBookingStatus = "pending"
      }
    }
    
    // Check if equipment has any pending bookings (to make it unavailable for others)
    const hasPendingBookings = await db.collection("bookings").findOne({
      "bookingItems.equipmentId": new ObjectId(id),
      status: "pending"
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        ...equipment,
        userBookingStatus,
        hasPendingBookings: !!hasPendingBookings,
        ...(isAdmin && { supplierInfo })
      }
    })
  } catch (error) {
    console.error("Error fetching equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch equipment" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const updateData: any = { updatedAt: new Date() }

    if (body.hasOwnProperty("isAvailable")) {
      updateData.isAvailable = body.isAvailable
    }

    if (body.status) {
      updateData.status = body.status
      if (body.status === "approved") {
        updateData.approvedAt = new Date()
      }
    }

    await db.collection("equipment").updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    await triggerRealtimeUpdate('equipment')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update equipment" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const updateData: any = {
      description: body.description,
      categoryId: new ObjectId(body.categoryId),
      equipmentTypeId: new ObjectId(body.equipmentTypeId),
      pricing: body.pricing,
      location: body.location,
      images: body.images,
      specifications: body.specifications,
      listingType: body.listingType,
      updatedAt: new Date()
    }

    await db.collection("equipment").updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    await triggerRealtimeUpdate('equipment')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update equipment" },
      { status: 500 }
    )
  }
}

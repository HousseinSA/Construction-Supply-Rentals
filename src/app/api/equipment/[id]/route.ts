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

    let supplierInfo = null
    if (isAdmin && equipment.supplierId) {
      supplierInfo = await db.collection("users").findOne(
        { _id: equipment.supplierId },
        { projection: { password: 0 } }
      )
    }

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
    
    const now = new Date()
    
    const hasPendingBookings = await db.collection("bookings").findOne({
      "bookingItems.equipmentId": new ObjectId(id),
      status: "pending",
      // Only show as unavailable if booking is happening NOW (today is within the booking date range)
      startDate: { $lte: now },
      endDate: { $gte: now }
    })

    const hasActiveBookings = await db.collection("bookings").findOne({
      "bookingItems.equipmentId": new ObjectId(id),
      status: { $in: ["pending", "paid"] },
      // Only show as unavailable if booking is happening NOW
      startDate: { $lte: now },
      endDate: { $gte: now }
    })

    return NextResponse.json({ 
      success: true, 
      data: {
        ...equipment,
        userBookingStatus,
        hasPendingBookings: !!hasPendingBookings,
        hasActiveBookings: !!hasActiveBookings,
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
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const isAdmin = session.user.role === "admin"
    const userId = session.user.id

    const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(id) })
    if (!equipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 }
      )
    }

    if (!isAdmin && equipment.supplierId?.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "You don't own this equipment" },
        { status: 403 }
      )
    }

    const updateData: any = { updatedAt: new Date() }

    if (body.hasOwnProperty("isAvailable")) {
      const hasActiveBookings = await db.collection("bookings").findOne({
        "bookingItems.equipmentId": new ObjectId(id),
        status: { $in: ["pending", "paid"] }
      })
      const hasPendingSale = await db.collection("sales").findOne({
        equipmentId: new ObjectId(id),
        status: { $in: ["pending", "paid"] }
      })
      
      if (hasActiveBookings || hasPendingSale) {
        return NextResponse.json(
          { success: false, error: "Cannot change availability - equipment has active bookings or pending sales" },
          { status: 400 }
        )
      }
      
      updateData.isAvailable = body.isAvailable
      if (!isAdmin && equipment.status === "approved") {
        updateData.status = "approved"
      }
    }

    if (isAdmin && body.status) {
      updateData.status = body.status
      if (body.status === "approved") {
        updateData.approvedAt = new Date()
        updateData.approvedBy = new ObjectId(userId)
        updateData.rejectionReason = null
        updateData.rejectedAt = null
        
        // Send approval email to supplier
        try {
          const supplier = await db.collection("users").findOne({ _id: equipment.supplierId })
          if (supplier?.email) {
            const { sendEquipmentApprovalEmail } = await import("@/src/lib/email")
            await sendEquipmentApprovalEmail(supplier.email, {
              equipmentName: equipment.name,
              supplierFirstName: supplier.firstName
            })
          }
        } catch (emailError) {
          console.error("Email error:", emailError)
        }
      } else if (body.status === "rejected") {
        if (!body.rejectionReason || body.rejectionReason.trim() === "") {
          return NextResponse.json(
            { success: false, error: "Rejection reason is required" },
            { status: 400 }
          )
        }
        updateData.rejectionReason = body.rejectionReason
        updateData.rejectedAt = new Date()
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
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const isAdmin = session.user.role === "admin"
    const userId = session.user.id

    const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(id) })
    if (!equipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 }
      )
    }

    if (!isAdmin && equipment.supplierId?.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "You don't own this equipment" },
        { status: 403 }
      )
    }

    const updateData: any = { updatedAt: new Date() }

    if (isAdmin) {
      if (body.description !== undefined) updateData.description = body.description
      if (body.images !== undefined) updateData.images = body.images
      if (body.specifications !== undefined) updateData.specifications = body.specifications
      if (body.pricing !== undefined) {
        updateData.pricing = body.pricing
        updateData.pendingPricing = null 
        updateData.pricingRejectionReason = null 
      }
      if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable
      
      const lockedFields = ['categoryId', 'equipmentTypeId', 'location', 'listingType', 'usageCategory']
      for (const field of lockedFields) {
        if (body[field] !== undefined && body[field] !== equipment[field]?.toString()) {
          return NextResponse.json(
            { success: false, error: `Cannot modify locked field: ${field}` },
            { status: 400 }
          )
        }
      }
      
      updateData.lastEditedAt = new Date()
    } else {
      if (body.description !== undefined) updateData.description = body.description
      if (body.images !== undefined) updateData.images = body.images
      if (body.specifications !== undefined) updateData.specifications = body.specifications
      
      updateData.lastEditedAt = new Date()
      
      // If equipment is rejected and supplier is editing, automatically resubmit for review
      if (equipment.status === "rejected") {
        updateData.status = "pending"
        updateData.rejectionReason = null
        updateData.rejectedAt = null
      }
      
      if (body.pricing !== undefined) {
        const pricingChanged = JSON.stringify(equipment.pricing) !== JSON.stringify(body.pricing)
        
        if (pricingChanged) {
          if (equipment.pendingPricing) {
            return NextResponse.json(
              { success: false, error: "You already have a pending pricing change request. Please wait for admin review." },
              { status: 400 }
            )
          }
          
          updateData.pendingPricing = {
            ...body.pricing,
            requestedAt: new Date()
          }
          updateData.pricingRejectionReason = null
          
          // Send email notification to admin
          try {
            const supplier = await db.collection("users").findOne({ _id: equipment.supplierId })
            const adminUser = await db.collection("users").findOne({ role: "admin" })
            
            if (adminUser?.email && supplier) {
              const formatPricing = (pricing: any) => {
                const parts = []
                if (pricing.hourlyRate) parts.push(`${pricing.hourlyRate} MRU/h`)
                if (pricing.dailyRate) parts.push(`${pricing.dailyRate} MRU/jour`)
                if (pricing.kmRate) parts.push(`${pricing.kmRate} MRU/km`)
                if (pricing.tonRate) parts.push(`${pricing.tonRate} MRU/tonne`)
                if (pricing.salePrice) parts.push(`${pricing.salePrice} MRU`)
                return parts.join(', ') || '-'
              }
              
              const { sendPricingUpdateRequestEmail } = await import("@/src/lib/email")
              await sendPricingUpdateRequestEmail(adminUser.email, {
                equipmentName: equipment.name,
                equipmentReference: equipment.referenceNumber || '-',
                supplierName: `${supplier.firstName} ${supplier.lastName}`,
                supplierPhone: supplier.phone,
                currentPricing: formatPricing(equipment.pricing),
                requestedPricing: formatPricing(body.pricing),
                requestDate: new Date()
              })
            }
          } catch (emailError) {
            console.error("Email error:", emailError)
          }
        }
      }
    }

    await db.collection("equipment").updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    await triggerRealtimeUpdate('equipment')
    
    return NextResponse.json({ 
      success: true,
      hasPendingPricing: !!updateData.pendingPricing
    })
  } catch (error) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update equipment" },
      { status: 500 }
    )
  }
}

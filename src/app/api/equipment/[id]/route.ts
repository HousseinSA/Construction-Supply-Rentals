import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get("admin") === "true"

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 },
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
        { status: 404 },
      )
    }

    let supplierInfo = null
    if (isAdmin && equipment.supplierId) {
      supplierInfo = await db
        .collection("users")
        .findOne({ _id: equipment.supplierId }, { projection: { password: 0 } })
    }

    const session = await getServerSession(authOptions)
    let userBookingStatus = null

    if (session?.user?.id) {
      const pendingBooking = await db.collection("bookings").findOne({
        renterId: new ObjectId(session.user.id),
        "bookingItems.equipmentId": new ObjectId(id),
        status: "pending",
      })

      if (pendingBooking) {
        userBookingStatus = "pending"
      }
    }

    const now = new Date()

    const hasPendingBookings = await db.collection("bookings").findOne({
      "bookingItems.equipmentId": new ObjectId(id),
      status: "pending",
      startDate: { $lte: now },
      endDate: { $gte: now },
    })

    const hasActiveBookings = await db.collection("bookings").findOne({
      "bookingItems.equipmentId": new ObjectId(id),
      status: { $in: ["pending", "paid"] },
      startDate: { $lte: now },
      endDate: { $gte: now },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...equipment,
        userBookingStatus,
        hasPendingBookings: !!hasPendingBookings,
        hasActiveBookings: !!hasActiveBookings,
        ...(isAdmin && { supplierInfo }),
      },
    })
  } catch (error) {
    console.error("Error fetching equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch equipment" },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      )
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 },
      )
    }

    const db = await connectDB()
    const isAdmin = session.user.role === "admin"
    const userId = session.user.id

    const equipment = await db
      .collection("equipment")
      .findOne({ _id: new ObjectId(id) })
    if (!equipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 },
      )
    }

    if (!isAdmin && equipment.supplierId?.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "You don't own this equipment" },
        { status: 403 },
      )
    }

    const updateData: any = { updatedAt: new Date() }

    if (body.hasOwnProperty("isAvailable")) {
      const hasActiveBookings = await db.collection("bookings").findOne({
        "bookingItems.equipmentId": new ObjectId(id),
        status: { $in: ["pending", "paid"] },
      })
      const hasPendingSale = await db.collection("sales").findOne({
        equipmentId: new ObjectId(id),
        status: { $in: ["pending", "paid"] },
      })

      if (hasActiveBookings || hasPendingSale) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Cannot change availability - equipment has active bookings or pending sales",
          },
          { status: 400 },
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

        try {
          const supplier = await db
            .collection("users")
            .findOne({ _id: equipment.supplierId })
          if (supplier?.email) {
            const { sendEquipmentApprovalEmail } =
              await import("@/src/lib/email")
            await sendEquipmentApprovalEmail(supplier.email, {
              equipmentName: equipment.name,
              supplierName: supplier.firstName,
            })
          }
        } catch (emailError) {
          console.error("Email error:", emailError)
        }
      } else if (body.status === "rejected") {
        updateData.rejectionReason = body.rejectionReason
        updateData.rejectedAt = new Date()
      }
    }

    await db
      .collection("equipment")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update equipment" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      )
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 },
      )
    }

    const db = await connectDB()
    const isAdmin = session.user.role === "admin"
    const userId = session.user.id

    const equipment = await db
      .collection("equipment")
      .findOne({ _id: new ObjectId(id) })
    if (!equipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 },
      )
    }

    if (!isAdmin && equipment.supplierId?.toString() !== userId) {
      return NextResponse.json(
        { success: false, error: "You don't own this equipment" },
        { status: 403 },
      )
    }

    const updateData: any = { updatedAt: new Date() }

    if (isAdmin) {
      if (body.description !== undefined)
        updateData.description = body.description
      if (body.images !== undefined) updateData.images = body.images
      if (body.specifications !== undefined)
        updateData.specifications = body.specifications
      if (body.pricing !== undefined) {
        updateData.pricing = { ...equipment.pricing, ...body.pricing }

        if (equipment.pendingPricing) {
          const remainingPending: any = {}
          Object.keys(equipment.pendingPricing).forEach((key) => {
            if (!body.pricing.hasOwnProperty(key)) {
              remainingPending[key] = equipment.pendingPricing[key]
            }
          })
          updateData.pendingPricing =
            Object.keys(remainingPending).length > 0 ? remainingPending : null
        }
      }
      if (body.isAvailable !== undefined)
        updateData.isAvailable = body.isAvailable

      const lockedFields = [
        "categoryId",
        "equipmentTypeId",
        "location",
        "listingType",
        "usageCategory",
      ]
      for (const field of lockedFields) {
        if (
          body[field] !== undefined &&
          body[field] !== equipment[field]?.toString()
        ) {
          return NextResponse.json(
            { success: false, error: `Cannot modify locked field: ${field}` },
            { status: 400 },
          )
        }
      }

      updateData.lastEditedAt = new Date()
    } else {
      if (body.description !== undefined)
        updateData.description = body.description
      if (body.images !== undefined) updateData.images = body.images
      if (body.specifications !== undefined)
        updateData.specifications = body.specifications

      updateData.lastEditedAt = new Date()

      if (equipment.status === "rejected") {
        updateData.status = "pending"
        updateData.rejectionReason = null
        updateData.rejectedAt = null
      }

      if (body.pricing !== undefined) {
        const changedPricing: any = {}
        let hasChanges = false

        const priceFields = [
          "hourlyRate",
          "dailyRate",
          "monthlyRate",
          "kmRate",
          "tonRate",
          "salePrice",
        ]
        priceFields.forEach((field) => {
          const newValue = body.pricing[field]
          const currentValue = equipment.pricing[field]

          if (newValue !== undefined && newValue !== currentValue) {
            changedPricing[field] = newValue
            hasChanges = true
          }
        })

        if (hasChanges) {
          // Only create pendingPricing if equipment is already approved
          if (equipment.status === "approved") {
            updateData.pendingPricing = equipment.pendingPricing
              ? { ...equipment.pendingPricing, ...changedPricing }
              : changedPricing
          if (
            equipment.pricingRejectionReasons ||
            equipment.rejectedPricingValues
          ) {
            const remainingRejections: any = {}
            const remainingValues: any = {}

            if (equipment.pricingRejectionReasons?._all) {
              let hasUnfixedRejections = false
              Object.keys(equipment.rejectedPricingValues || {}).forEach(
                (key) => {
                  const wasNotChanged = !changedPricing.hasOwnProperty(key)

                  if (wasNotChanged) {
                    hasUnfixedRejections = true
                    remainingValues[key] = equipment.rejectedPricingValues[key]
                  }
                },
              )

              if (hasUnfixedRejections) {
                remainingRejections._all =
                  equipment.pricingRejectionReasons._all
              }
            }

            if (equipment.pricingRejectionReasons) {
              Object.keys(equipment.pricingRejectionReasons).forEach((key) => {
                if (key === "_all") return

                const wasNotChanged = !changedPricing.hasOwnProperty(key)

                if (wasNotChanged) {
                  remainingRejections[key] =
                    equipment.pricingRejectionReasons[key]
                  if (equipment.rejectedPricingValues?.[key]) {
                    remainingValues[key] = equipment.rejectedPricingValues[key]
                  }
                }
              })
            } else if (equipment.rejectedPricingValues) {
              Object.keys(equipment.rejectedPricingValues).forEach((key) => {
                const wasNotChanged = !changedPricing.hasOwnProperty(key)
                if (wasNotChanged) {
                  remainingValues[key] = equipment.rejectedPricingValues[key]
                }
              })
            }

            if (
              Object.keys(remainingRejections).length > 0 ||
              Object.keys(remainingValues).length > 0
            ) {
              updateData.pricingRejectionReasons =
                Object.keys(remainingRejections).length > 0
                  ? remainingRejections
                  : null
              updateData.rejectedPricingValues =
                Object.keys(remainingValues).length > 0 ? remainingValues : null
            } else {
              updateData.pricingRejectionReasons = null
              updateData.rejectedPricingValues = null
            }
          }

          try {
            const supplier = await db
              .collection("users")
              .findOne({ _id: equipment.supplierId })
            const adminUser = await db
              .collection("users")
              .findOne({ role: "admin" })

            if (adminUser?.email && supplier) {
              const formatPricing = (pricing: any) => {
                const parts = []
                if (pricing.hourlyRate)
                  parts.push(`${pricing.hourlyRate} MRU/h`)
                if (pricing.dailyRate)
                  parts.push(`${pricing.dailyRate} MRU/jour`)
                if (pricing.kmRate) parts.push(`${pricing.kmRate} MRU/km`)
                if (pricing.tonRate) parts.push(`${pricing.tonRate} MRU/tonne`)
                if (pricing.salePrice) parts.push(`${pricing.salePrice} MRU`)
                return parts.join(", ") || "-"
              }

              const { sendPricingUpdateRequestEmail } =
                await import("@/src/lib/email")
              await sendPricingUpdateRequestEmail(adminUser.email, {
                equipmentName: equipment.name,
                equipmentReference: equipment.referenceNumber || "-",
                supplierName: `${supplier.firstName} ${supplier.lastName}`,
                supplierPhone: supplier.phone,
                currentPricing: formatPricing(equipment.pricing),
                requestedPricing: formatPricing(body.pricing),
                requestDate: new Date(),
              })
            }
          } catch (emailError) {
            console.error("Email error:", emailError)
          }
          } else {
            updateData.pricing = { ...equipment.pricing, ...changedPricing }
            updateData.pendingPricing = null
            updateData.pricingRejectionReasons = null
            updateData.rejectedPricingValues = null
          }
        }
      }
    }

    await db
      .collection("equipment")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return NextResponse.json({
      success: true,
      hasPendingPricing: !!updateData.pendingPricing,
    })
  } catch (error) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update equipment" },
      { status: 500 },
    )
  }
}

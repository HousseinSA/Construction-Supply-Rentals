import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { validateBooking } from "@/src/lib/validation"
import { triggerRealtimeUpdate } from "@/src/lib/realtime-trigger"
import { generateReferenceNumber } from "@/src/lib/reference-number"
import {
  calculateSubtotal,
  validateReferences,
  checkEquipmentAvailability,
  calculateBookingEndDate,
  getConflictingBooking,
} from "@/src/lib/booking-utils"
import { BookingItem } from "@/src/lib/models/booking"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "50")

    const db = await connectDB()

    const pipeline: any[] = []

    if (session.user.role !== "admin") {
      pipeline.push({
        $match: { renterId: new ObjectId(session.user.id) },
      })
    }

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "renterId",
        foreignField: "_id",
        as: "renterInfo",
      },
    })

    if (session.user.role === "admin") {
      pipeline.push(
        {
          $addFields: {
            supplierIds: {
              $map: {
                input: "$bookingItems",
                as: "item",
                in: "$$item.supplierId",
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "supplierIds",
            foreignField: "_id",
            as: "supplierInfo",
          },
        },
        {
          $addFields: {
            hasAdminCreatedEquipment: {
              $anyElementTrue: {
                $map: {
                  input: "$supplierInfo",
                  as: "supplier",
                  in: { $eq: ["$$supplier.role", "admin"] },
                },
              },
            },
          },
        }
      )
    }

    pipeline.push(
      {
        $addFields: {
          equipmentIds: {
            $map: {
              input: "$bookingItems",
              as: "item",
              in: "$$item.equipmentId",
            },
          },
        },
      },
      {
        $lookup: {
          from: "equipment",
          localField: "equipmentIds",
          foreignField: "_id",
          as: "equipmentDetails",
        },
      },
      {
        $addFields: {
          bookingItems: {
            $map: {
              input: "$bookingItems",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    equipmentImage: {
                      $let: {
                        vars: {
                          equipment: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$equipmentDetails",
                                  as: "eq",
                                  cond: {
                                    $eq: ["$$eq._id", "$$item.equipmentId"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: { $arrayElemAt: ["$$equipment.images", 0] },
                      },
                    },
                    equipmentCreatedBy: {
                      $let: {
                        vars: {
                          equipment: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$equipmentDetails",
                                  as: "eq",
                                  cond: {
                                    $eq: ["$$eq._id", "$$item.equipmentId"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: "$$equipment.createdBy",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $project: { equipmentDetails: 0, equipmentIds: 0 } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    )

    const bookings = await db
      .collection("bookings")
      .aggregate(pipeline)
      .toArray()

    // Get total count for pagination info (exclude skip/limit)
    const countPipeline = pipeline.slice(0, -2) // Remove $skip and $limit
    const totalCountResult = await db
      .collection("bookings")
      .aggregate([...countPipeline, { $count: "total" }])
      .toArray()
    const total = totalCountResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length,
      total,
      skip,
      limit,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bookings",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBooking(body)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errors.join(", "),
        },
        { status: 400 }
      )
    }

    const db = await connectDB()

    const equipmentId = new ObjectId(body.equipmentId)
    const bookingItems = [
      {
        equipmentId: body.equipmentId,
      },
    ]

    const refErrors = await validateReferences(db, { ...body, bookingItems })
    if (refErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors: refErrors,
        },
        { status: 400 }
      )
    }

    const {
      rate,
      subtotal,
      equipmentName,
      supplierId,
      usageUnit,
      pricingType,
    } = await calculateSubtotal(db, equipmentId, body.usage, body.pricingType)

    let calculatedEndDate: Date | undefined
    if (body.startDate) {
      if (body.endDate && pricingType === "daily") {
        calculatedEndDate = new Date(body.endDate)
      } else if (
        pricingType === "hourly" ||
        pricingType === "per_km" ||
        pricingType === "monthly"
      ) {
        calculatedEndDate = calculateBookingEndDate(
          body.startDate,
          body.usage,
          pricingType
        )
      }
    }

    const available = await checkEquipmentAvailability(
      db,
      equipmentId,
      body.startDate,
      calculatedEndDate || body.endDate
    )
    if (!available) {
      const conflictingBooking = await getConflictingBooking(
        db,
        equipmentId,
        body.startDate,
        calculatedEndDate || body.endDate
      )

      const equipment = await db
        .collection("equipment")
        .findOne({ _id: equipmentId })
      const startDateStr = conflictingBooking?.startDate
        ? new Date(conflictingBooking.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : ""
      const endDateStr = conflictingBooking?.endDate
        ? new Date(conflictingBooking.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : ""

      return NextResponse.json(
        {
          success: false,
          error: `Equipment ${equipment?.name} is already booked for ${startDateStr} - ${endDateStr}. Please select different dates.`,
          conflictingDates: conflictingBooking
            ? {
                startDate: conflictingBooking.startDate,
                endDate: conflictingBooking.endDate,
              }
            : null,
        },
        { status: 409 }
      )
    }

    const commission = body.commission || 0
    const bookingItem: BookingItem = {
      equipmentId,
      supplierId,
      equipmentName,
      pricingType,
      rate,
      usage: body.usage,
      usageUnit,
      subtotal,
      commission,
    }

    const referenceNumber = await generateReferenceNumber("booking")
    const result = await db.collection("bookings").insertOne({
      referenceNumber,
      renterId: new ObjectId(body.renterId),
      bookingItems: [bookingItem],
      totalPrice: subtotal,
      totalCommission: commission,
      grandTotal: subtotal,
      status: "pending",
      renterMessage: body.renterMessage || "",
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate:
        calculatedEndDate ||
        (body.endDate ? new Date(body.endDate) : undefined),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const equipment = await db.collection("equipment").findOne({
      _id: bookingItem.equipmentId,
    })

    // Send email asynchronously without blocking response
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      Promise.resolve().then(async () => {
        try {
          const renter = await db
            .collection("users")
            .findOne({ _id: new ObjectId(body.renterId) })

          let supplierName = "admin"
          let supplierPhone = ""
          if (bookingItem.supplierId) {
            const supplier = await db
              .collection("users")
              .findOne({ _id: bookingItem.supplierId })
            if (supplier) {
              supplierName = `${supplier.firstName} ${supplier.lastName}`
              supplierPhone = supplier.phone || ""
            }
          }

          const { sendNewBookingEmail } = await import("@/src/lib/email")
          await sendNewBookingEmail(adminEmail, {
            referenceNumber,
            equipmentName: bookingItem.equipmentName,
            totalPrice: subtotal,
            commission,
            renterName: renter
              ? `${renter.firstName} ${renter.lastName}`
              : "Unknown",
            renterPhone: renter?.phone || "N/A",
            supplierName,
            supplierPhone,
            usage: bookingItem.usage,
            usageUnit: bookingItem.usageUnit,
            rate: bookingItem.rate,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            endDate: calculatedEndDate,
            bookingDate: new Date(),
          })
        } catch (err) {
          console.error("Email error:", err)
        }
      })
    }

    triggerRealtimeUpdate("booking").catch((err) =>
      console.error("Realtime update error:", err)
    )

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertedId,
          totalPrice: subtotal,
          status: "pending",
          equipmentName: bookingItem.equipmentName,
          usage: bookingItem.usage,
          rate: bookingItem.rate,
          subtotal: bookingItem.subtotal,
          equipment: equipment || null,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create booking",
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status, adminId, adminNotes } = body

    if (!bookingId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: bookingId, status",
        },
        { status: 400 }
      )
    }

    const db = await connectDB()

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID" },
        { status: 400 }
      )
    }

    const bookingObjectId = new ObjectId(bookingId)

    // Always validate cancellation
    if (status === "cancelled") {
      const booking = await db
        .collection("bookings")
        .findOne({ _id: bookingObjectId })
      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        )
      }
      if (booking.status !== "pending") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Only pending bookings can be cancelled. Please contact support for assistance.",
          },
          { status: 400 }
        )
      }

      // Send notification email for non-admin cancellations
      if (!adminId) {
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail) {
          const renter = await db
            .collection("users")
            .findOne({ _id: booking.renterId })
          const firstItem = booking.bookingItems[0]

          const { sendBookingCancellationEmail } = await import(
            "@/src/lib/email"
          )
          await sendBookingCancellationEmail(adminEmail, {
            referenceNumber: booking.referenceNumber,
            equipmentName: firstItem?.equipmentName || "N/A",
            renterName: renter
              ? `${renter.firstName} ${renter.lastName}`
              : "Unknown",
            renterPhone: renter?.phone || "N/A",
            cancellationDate: new Date(),
          }).catch((err: any) => console.error("Email error:", err))
        }
      }
    }
    const { updateBookingStatus } = await import("@/src/lib/booking-service")

    await updateBookingStatus(
      db,
      bookingObjectId,
      status,
      adminId ? new ObjectId(adminId) : undefined,
      adminNotes
    )

    await triggerRealtimeUpdate("booking")
    await triggerRealtimeUpdate("equipment")

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update booking status",
      },
      { status: 400 }
    )
  }
}

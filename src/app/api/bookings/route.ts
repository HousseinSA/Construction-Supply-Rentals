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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "50")
    
    const db = await connectDB()

    const pipeline: any[] = []
    
    if (session.user.role !== 'admin') {
      pipeline.push({
        $match: { renterId: new ObjectId(session.user.id) }
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

    if (session.user.role === 'admin') {
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
                  in: { $eq: ["$$supplier.role", "admin"] }
                }
              }
            }
          }
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
                                  cond: { $eq: ["$$eq._id", "$$item.equipmentId"] },
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
                                  cond: { $eq: ["$$eq._id", "$$item.equipmentId"] },
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
    const totalCountResult = await db.collection("bookings").aggregate([...countPipeline, { $count: "total" }]).toArray()
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

    const refErrors = await validateReferences(db, body)
    if (refErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors: refErrors,
        },
        { status: 400 }
      )
    }

    const bookingItems: BookingItem[] = []
    let totalPrice = 0
    let calculatedEndDate: Date | undefined

    for (const item of body.bookingItems) {
      const equipmentId = new ObjectId(item.equipmentId)

      const available = await checkEquipmentAvailability(
        db, 
        equipmentId, 
        body.startDate, 
        body.endDate
      )
      if (!available) {
        // Get the conflicting booking dates
        const conflictingBooking = await getConflictingBooking(
          db,
          equipmentId,
          body.startDate,
          body.endDate
        )
        
        const equipment = await db.collection('equipment').findOne({ _id: equipmentId })
        const startDateStr = conflictingBooking?.startDate 
          ? new Date(conflictingBooking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : ''
        const endDateStr = conflictingBooking?.endDate
          ? new Date(conflictingBooking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : ''
        
        return NextResponse.json(
          {
            success: false,
            error: `Equipment ${equipment?.name} is already booked for ${startDateStr} - ${endDateStr}. Please select different dates.`,
            conflictingDates: conflictingBooking ? { startDate: conflictingBooking.startDate, endDate: conflictingBooking.endDate } : null
          },
          { status: 409 }
        )
      }

      const { rate, subtotal, equipmentName, supplierId, usageUnit, pricingType } =
        await calculateSubtotal(db, equipmentId, item.usage, item.pricingType)

      if (body.startDate && !calculatedEndDate) {
        if (body.endDate && pricingType === 'daily') {
          calculatedEndDate = new Date(body.endDate)
        } else if (pricingType === 'hourly' || pricingType === 'per_km' || pricingType === 'monthly') {
          calculatedEndDate = calculateBookingEndDate(body.startDate, item.usage, pricingType)
        }
      }

      bookingItems.push({
        equipmentId,
        supplierId,
        equipmentName,
        pricingType,
        rate,
        usage: item.usage,
        usageUnit,
        subtotal,
      })

      totalPrice += subtotal
    }

    const grandTotal = totalPrice

    const referenceNumber = await generateReferenceNumber('booking')
    const result = await db.collection("bookings").insertOne({
      referenceNumber,
      renterId: new ObjectId(body.renterId),
      bookingItems,
      totalPrice,
      grandTotal,
      status: "pending",
      renterMessage: body.renterMessage || "",
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: calculatedEndDate || (body.endDate ? new Date(body.endDate) : undefined),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      const renter = await db.collection('users').findOne({ _id: new ObjectId(body.renterId) })
      
      const suppliers = await Promise.all(
        bookingItems.map(async (item) => {
          if (!item.supplierId) return null;
          const supplier = await db.collection('users').findOne({ _id: item.supplierId })
          return {
            name: supplier ? `${supplier.firstName} ${supplier.lastName}` : 'N/A',
            phone: supplier?.phone || 'N/A',
            equipment: item.equipmentName,
            duration: `${item.usage} ${item.usageUnit || ''}`
          }
        })
      )
      
      const { sendNewBookingEmail } = await import('@/src/lib/email')
      await sendNewBookingEmail(adminEmail, {
        referenceNumber,
        equipmentNames: bookingItems.map(item => item.equipmentName),
        totalPrice,
        renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
        renterPhone: renter?.phone || 'N/A',
        renterLocation: renter?.city || undefined,
        bookingDate: new Date(),
        suppliers: suppliers.filter(s => s !== null) as Array<{ name: string; phone: string; equipment: string; duration: string }>
      }).catch(err => console.error('Email error:', err))
    }

    await triggerRealtimeUpdate('booking')

    const equipment = await db.collection('equipment').findOne({
      _id: bookingItems[0]?.equipmentId
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertedId,
          totalPrice,
          itemCount: bookingItems.length,
          status: "pending",
          bookingItems: bookingItems.map((item) => ({
            equipmentName: item.equipmentName,
            usage: item.usage,
            rate: item.rate,
            subtotal: item.subtotal,
          })),
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
    if (status === 'cancelled') {
      const booking = await db.collection('bookings').findOne({ _id: bookingObjectId })
      if (!booking) {
        return NextResponse.json(
          { success: false, error: "Booking not found" },
          { status: 404 }
        )
      }
      if (booking.status !== 'pending') {
        return NextResponse.json(
          {
            success: false,
            error: "Only pending bookings can be cancelled. Please contact support for assistance.",
          },
          { status: 400 }
        )
      }

      // Send notification email for non-admin cancellations
      if (!adminId) {
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail) {
          const renter = await db.collection('users').findOne({ _id: booking.renterId })
        
        const suppliers = await Promise.all(
          booking.bookingItems.map(async (item: any) => {
            if (!item.supplierId) return null;
            const supplier = await db.collection('users').findOne({ _id: item.supplierId })
            return {
              name: supplier ? `${supplier.firstName} ${supplier.lastName}` : 'N/A',
              phone: supplier?.phone || 'N/A',
              equipment: item.equipmentName,
              duration: `${item.usage} ${item.usageUnit || ''}`
            }
          })
        )
        
        const { sendBookingCancellationEmail } = await import('@/src/lib/email')
        await sendBookingCancellationEmail(adminEmail, {
          referenceNumber: booking.referenceNumber,
          equipmentNames: booking.bookingItems.map((item: any) => item.equipmentName),
          totalPrice: booking.totalPrice,
          renterName: renter ? `${renter.firstName} ${renter.lastName}` : 'Unknown',
          renterPhone: renter?.phone || 'N/A',
          renterLocation: renter?.city || undefined,
          cancellationDate: new Date(),
          suppliers: suppliers.filter(s => s !== null) as Array<{ name: string; phone: string; equipment: string; duration: string }>
        }).catch((err: any) => console.error('Email error:', err))
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

    await triggerRealtimeUpdate('booking')
    await triggerRealtimeUpdate('equipment')

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

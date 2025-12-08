import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { validateBooking } from "@/src/lib/validation"
import { triggerRealtimeUpdate } from "@/src/lib/realtime-trigger"
import { generateReferenceNumber } from "@/src/lib/reference-number"
import {
  calculateSubtotal,
  validateReferences,
  checkEquipmentAvailability,
} from "@/src/lib/booking-utils"
import { BookingItem } from "@/src/lib/models/booking"

// GET /api/bookings - Get bookings with renter/supplier details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const renterId = searchParams.get('renterId')
    
    const db = await connectDB()

    const pipeline: any[] = []
    
    // Filter by renterId if provided (for renter users)
    if (renterId) {
      pipeline.push({
        $match: { renterId: new ObjectId(renterId) }
      })
    }

    // Always add renter lookup
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "renterId",
        foreignField: "_id",
        as: "renterInfo",
      },
    })

    // Only add supplier lookup for admin/supplier views (renters don't see suppliers)
    if (!renterId) {
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

    // Add equipment images and creation info lookup
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
      { $sort: { createdAt: -1 } }
    )

    const bookings = await db
      .collection("bookings")
      .aggregate(pipeline)
      .toArray()

    return NextResponse.json({
      success: true,
      data: bookings,
      count: bookings.length,
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
          error: refErrors.join(", "),
        },
        { status: 400 }
      )
    }

    const bookingItems: BookingItem[] = []
    let totalPrice = 0

    for (const item of body.bookingItems) {
      const equipmentId = new ObjectId(item.equipmentId)

      const available = await checkEquipmentAvailability(db, equipmentId)
      if (!available) {
        return NextResponse.json(
          {
            success: false,
            error: `Equipment ${item.equipmentId} is currently unavailable`,
          },
          { status: 409 }
        )
      }

      const { rate, subtotal, equipmentName, supplierId, usageUnit, pricingType } =
        await calculateSubtotal(db, equipmentId, item.usage, item.pricingType)

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

    // Create booking (no dates)
    const referenceNumber = await generateReferenceNumber('booking')
    const result = await db.collection("bookings").insertOne({
      referenceNumber,
      renterId: new ObjectId(body.renterId),
      bookingItems,
      totalPrice,
      status: "pending",
      renterMessage: body.renterMessage || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Send email to admin
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      const renter = await db.collection('users').findOne({ _id: new ObjectId(body.renterId) })
      
      // Get supplier details for each booking item
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

// PUT /api/bookings - Update booking status
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
    const { updateBookingStatus } = await import("@/src/lib/booking-service")

    await updateBookingStatus(
      db,
      new ObjectId(bookingId),
      status,
      adminId ? new ObjectId(adminId) : undefined,
      adminNotes
    )

    await triggerRealtimeUpdate('booking')

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

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { validateBooking } from "@/src/lib/validation"
import {
  buildBookingAggregationPipeline,
  sendBookingCreatedNotification,
  successResponse,
  errorResponse,
} from "@/src/lib/api-helpers"
import { createBooking, handleBookingCancellation, updateBookingStatus } from "@/src/lib/booking-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return errorResponse("Unauthorized", 401)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const date = searchParams.get("date")

    const db = await connectDB()

    const pipeline = buildBookingAggregationPipeline({
      userId: session.user.role === "admin" ? undefined : session.user.id,
      isAdmin: session.user.role === "admin",
      status,
      date,
      search,
      page,
      limit,
    })

    const result = await db.collection("bookings").aggregate(pipeline).toArray()

    const bookings = result[0]?.data || []
    const total = result[0]?.total[0]?.count || 0
    const totalPages = Math.ceil(total / limit)

    return successResponse({
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        itemsPerPage: limit,
      },
    })
  } catch (error) {
    return errorResponse("Failed to fetch bookings", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = validateBooking(body)
    if (!validation.valid) {
      return errorResponse(validation.errors.join(", "), 400)
    }

    const db = await connectDB()

    const result = await createBooking(db, {
      renterId: body.renterId,
      equipmentId: body.equipmentId,
      usage: body.usage,
      pricingType: body.pricingType,
      startDate: body.startDate,
      endDate: body.endDate,
      renterMessage: body.renterMessage,
      commission: body.commission,
    })

    sendBookingCreatedNotification(db, {
      referenceNumber: result.referenceNumber,
      renterId: new ObjectId(body.renterId),
      bookingItems: result.bookingItems,
      totalPrice: result.totalPrice,
      commission: result.commission,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: result.calculatedEndDate,
      equipmentReferenceNumber: result.equipmentReferenceNumber,
    }).catch((err) => console.error("Email error:", err))

    return successResponse(
      {
        data: {
          id: result.id,
          totalPrice: result.totalPrice,
          status: result.status,
          equipmentName: result.equipmentName,
          usage: result.usage,
          rate: result.rate,
          subtotal: result.subtotal,
          equipment: result.equipment,
        },
      },
      201,
    )
  } catch (error: any) {
    if (error.statusCode === 409) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          conflictingDates: error.conflictingDates || null,
        },
        { status: 409 },
      )
    }
    return errorResponse(error.message || "Failed to create booking", 400)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status, adminId, adminNotes } = body

    if (!bookingId || !status) {
      return errorResponse("Missing required fields: bookingId, status", 400)
    }

    if (!ObjectId.isValid(bookingId)) {
      return errorResponse("Invalid booking ID", 400)
    }

    const db = await connectDB()
    const bookingObjectId = new ObjectId(bookingId)

    if (status === "cancelled") {
      await handleBookingCancellation(db, bookingObjectId, adminId)
    }

    await updateBookingStatus(
      db,
      bookingObjectId,
      status,
      adminId ? new ObjectId(adminId) : undefined,
      adminNotes,
    )

    return successResponse({
      message: "Booking status updated successfully",
    })
  } catch (error: any) {
    return errorResponse(
      error.message || "Failed to update booking status",
      400,
    )
  }
}

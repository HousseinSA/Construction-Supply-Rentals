import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/src/lib/mongodb'
import { ObjectId } from 'mongodb'
import { createNotification } from '@/src/lib/notifications'
import { validateBooking } from '@/src/lib/validation'
import { calculateSubtotal, validateReferences, checkEquipmentAvailability } from '@/src/lib/booking-utils'
import { BookingItem } from '@/src/lib/models/booking'

// GET /api/bookings - Get bookings with renter/supplier details
export async function GET() {
  try {
    const db = await connectDB()
    
    // Get bookings with populated renter and supplier info
    const bookings = await db.collection('bookings').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'renterId',
          foreignField: '_id',
          as: 'renterInfo'
        }
      },
      {
        $addFields: {
          supplierIds: {
            $map: {
              input: '$bookingItems',
              as: 'item',
              in: '$$item.supplierId'
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'supplierIds',
          foreignField: '_id',
          as: 'supplierInfo'
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray()
    
    return NextResponse.json({ 
      success: true, 
      data: bookings,
      count: bookings.length 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch bookings' 
    }, { status: 500 })
  }
}

// POST /api/bookings - Create usage-based booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateBooking(body)
    if (!validation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: validation.errors.join(', ') 
      }, { status: 400 })
    }

    const db = await connectDB()
    
    // Check referential integrity
    const refErrors = await validateReferences(db, body)
    if (refErrors.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: refErrors.join(', ') 
      }, { status: 400 })
    }

    // Process booking items - check availability and calculate pricing
    const bookingItems: BookingItem[] = []
    let totalPrice = 0

    for (const item of body.bookingItems) {
      const equipmentId = new ObjectId(item.equipmentId)
      
      // Check if equipment is available (not already booked)
      const available = await checkEquipmentAvailability(db, equipmentId)
      if (!available) {
        return NextResponse.json({ 
          success: false, 
          error: `Equipment ${item.equipmentId} is currently unavailable` 
        }, { status: 409 })
      }
      
      // Calculate pricing based on usage
      const { rate, subtotal, equipmentName, supplierId } = await calculateSubtotal(db, equipmentId, item.usage)
      
      bookingItems.push({
        equipmentId,
        supplierId,
        equipmentName,
        rate,
        usage: item.usage,
        subtotal
      })
      
      totalPrice += subtotal
    }

    // Create booking (no dates)
    const result = await db.collection('bookings').insertOne({
      renterId: new ObjectId(body.renterId),
      bookingItems,
      totalPrice,
      status: 'pending',
      renterMessage: body.renterMessage || '',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Create notification
    await createNotification(
      'new_booking',
      'New Usage-Based Booking',
      `New booking request for ${bookingItems.length} equipment items - Total: ${totalPrice}`,
      result.insertedId
    )

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: result.insertedId,
        totalPrice,
        itemCount: bookingItems.length,
        status: 'pending',
        bookingItems: bookingItems.map(item => ({
          equipmentName: item.equipmentName,
          usage: item.usage,
          rate: item.rate,
          subtotal: item.subtotal
        }))
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create booking' 
    }, { status: 500 })
  }
}

// PUT /api/bookings - Update booking status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status, adminId, adminNotes } = body

    if (!bookingId || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: bookingId, status' 
      }, { status: 400 })
    }

    const db = await connectDB()
    const { updateBookingStatus } = await import('@/src/lib/booking-service')
    
    await updateBookingStatus(
      db,
      new ObjectId(bookingId),
      status,
      adminId ? new ObjectId(adminId) : undefined,
      adminNotes
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Booking status updated successfully'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to update booking status' 
    }, { status: 400 })
  }
}
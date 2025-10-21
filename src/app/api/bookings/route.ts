import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/bookings - Get all bookings
export async function GET() {
  try {
    const db = await connectDB()
    const bookings = await db.collection('bookings').find({}).toArray()
    
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

// POST /api/bookings - Create new booking request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipmentId, customerName, customerEmail, customerPhone, startDate, endDate, location, message } = body

    if (!equipmentId || !customerName || !customerEmail || !startDate || !endDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: equipmentId, customerName, customerEmail, startDate, endDate' 
      }, { status: 400 })
    }

    const db = await connectDB()
    
    // Check if equipment exists
    const equipment = await db.collection('equipment').findOne({ _id: new ObjectId(equipmentId) })
    if (!equipment) {
      return NextResponse.json({ 
        success: false, 
        error: 'Equipment not found' 
      }, { status: 404 })
    }

    const result = await db.collection('bookings').insertOne({
      equipmentId: new ObjectId(equipmentId),
      equipmentName: equipment.name,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      message: message || '',
      status: 'pending', // pending, approved, rejected
      paymentStatus: 'pending', // pending, paid, failed
      totalAmount: 0, // Will be calculated after approval
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: result.insertedId,
        equipmentName: equipment.name,
        customerName,
        status: 'pending',
        message: 'Booking request submitted successfully'
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create booking' 
    }, { status: 500 })
  }
}
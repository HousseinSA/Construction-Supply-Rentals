import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'

// GET /api/equipment - Get all equipment
export async function GET() {
  try {
    const db = await connectDB()
    const equipment = await db.collection('equipment').find({}).toArray()
    
    return NextResponse.json({ 
      success: true, 
      data: equipment,
      count: equipment.length 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch equipment' 
    }, { status: 500 })
  }
}

// POST /api/equipment - Create new equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, pricePerDay, location, description, image } = body

    if (!name || !category || !pricePerDay || !location) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, category, pricePerDay, location' 
      }, { status: 400 })
    }

    const db = await connectDB()
    const result = await db.collection('equipment').insertOne({
      name,
      category,
      pricePerDay: Number(pricePerDay),
      location,
      description: description || '',
      image: image || '',
      available: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: result.insertedId,
        name,
        category,
        pricePerDay: Number(pricePerDay),
        location,
        description,
        image,
        available: true
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create equipment' 
    }, { status: 500 })
  }
}
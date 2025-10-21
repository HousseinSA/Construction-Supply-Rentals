import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'

// GET /api/users - Get all users
export async function GET() {
  try {
    const db = await connectDB()
    const users = await db.collection('users').find({}, { 
      projection: { password: 0 } // Exclude password from response
    }).toArray()
    
    return NextResponse.json({ 
      success: true, 
      data: users,
      count: users.length 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 })
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role = 'customer' } = body

    if (!name || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, email' 
      }, { status: 400 })
    }

    const db = await connectDB()
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        error: 'User with this email already exists' 
      }, { status: 409 })
    }

    const result = await db.collection('users').insertOne({
      name,
      email,
      phone: phone || '',
      role, // customer, admin
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: result.insertedId,
        name,
        email,
        phone,
        role,
        active: true
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create user' 
    }, { status: 500 })
  }
}
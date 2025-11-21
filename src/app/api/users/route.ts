import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/src/lib/mongodb'
import { ObjectId } from 'mongodb'
import { triggerRealtimeUpdate } from '@/src/lib/realtime-trigger'

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

// PATCH /api/users - Update user status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, status } = body

    if (!userId || !status || !['approved', 'blocked'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid userId or status' 
      }, { status: 400 })
    }

    const db = await connectDB()
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    await triggerRealtimeUpdate('user')

    return NextResponse.json({ 
      success: true, 
      message: `User ${status === 'blocked' ? 'blocked' : 'unblocked'} successfully`
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update user status' 
    }, { status: 500 })
  }
}

// POST /api/users - Create new user or check status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle status check for login
    if (body.action === 'checkStatus') {
      const { emailOrPhone, password } = body
      
      const db = await connectDB()
      const isEmail = emailOrPhone.includes("@")
      const query = isEmail
        ? { email: emailOrPhone }
        : { phone: emailOrPhone }

      const user = await db.collection('users').findOne(query)

      if (!user || user.password !== password) {
        return NextResponse.json({ 
          success: false, 
          error: 'INVALID_CREDENTIALS' 
        }, { status: 401 })
      }

      if (user.status === "blocked") {
        return NextResponse.json({ 
          success: false, 
          error: 'ACCOUNT_BLOCKED' 
        }, { status: 403 })
      }

      return NextResponse.json({ success: true })
    }
    
    // Handle user creation
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

    await triggerRealtimeUpdate('user')

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
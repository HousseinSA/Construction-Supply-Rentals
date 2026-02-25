import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/src/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role")

    const db = await connectDB()
    
    const query: any = {}
    
    if (role && role !== "all") {
      query.userType = role
    }

    if (search.trim()) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ]
    }

    const [users, total, statsData] = await Promise.all([
      db.collection('users')
        .find(query, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('users').countDocuments(query),
      db.collection('users').aggregate([
        { $match: { role: { $ne: "admin" } } },
        { $group: {
          _id: "$userType",
          count: { $sum: 1 }
        }}
      ]).toArray(),
    ])

    const totalPages = Math.ceil(total / limit)

    const supplierCount = statsData.find(s => s._id === "supplier")?.count || 0
    const renterCount = statsData.find(s => s._id === "renter")?.count || 0
    
    return NextResponse.json({ 
      success: true, 
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        itemsPerPage: limit,
      },
      stats: {
        totalUsers: supplierCount + renterCount,
        totalSuppliers: supplierCount,
        totalRenters: renterCount,
      },
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch users' 
    }, { status: 500 })
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
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

      return NextResponse.json({ 
        success: true, 
        userType: user.userType 
      })
    }
    
    const { name, email, phone, role = 'customer' } = body

    if (!name || !email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, email' 
      }, { status: 400 })
    }

    const db = await connectDB()
    
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
      role,
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
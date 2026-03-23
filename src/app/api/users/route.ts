import { NextRequest } from 'next/server'
import { connectDB } from '@/src/lib/mongodb'
import { ObjectId } from 'mongodb'
import {
  successResponse,
  errorResponse,
  validateObjectId,
  validatePagination,
  buildUserQuery,
  formatUserStats,
  buildUserAggregation,
  validateUserStatus,
  parseEmailOrPhone,
  shouldRefreshStats,
  getCachedStats,
  updateStatsCache
} from '@/src/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = validatePagination(
      searchParams.get('page'),
      searchParams.get('limit')
    )
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')

    const db = await connectDB()
    const query = buildUserQuery(search, role)
    const needsStats = shouldRefreshStats()
    const pipeline = buildUserAggregation(query, skip, limit, needsStats)

    const result = await db.collection('users').aggregate(pipeline).toArray()

    const users = result[0]?.users || []
    const total = result[0]?.totalCount[0]?.count || 0
    
    let stats
    if (needsStats) {
      const allUsersStats = await db.collection('users')
        .aggregate([
          { $match: { role: { $ne: 'admin' } } },
          { $group: { _id: '$userType', count: { $sum: 1 } } }
        ])
        .toArray()
      stats = formatUserStats(allUsersStats)
      updateStatsCache(stats)
    } else {
      stats = getCachedStats() || { totalUsers: 0, totalSuppliers: 0, totalRenters: 0 }
    }
    
    return successResponse({
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        itemsPerPage: limit,
      },
      stats,
    })
  } catch (error) {
    console.error('GET /api/users error:', error)
    return errorResponse('Failed to fetch users')
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, status } = await request.json()

    if (!userId || !status) {
      return errorResponse('Missing required fields: userId, status', 400)
    }

    if (!validateUserStatus(status)) {
      return errorResponse('Invalid status. Must be "approved" or "blocked"', 400)
    }

    const validation = validateObjectId(userId, 'userId')
    if (!validation.valid) return validation.error!

    const db = await connectDB()
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { status, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return errorResponse('User not found', 404)
    }

    return successResponse({
      message: `User ${status === 'blocked' ? 'blocked' : 'unblocked'} successfully`
    })
  } catch (error) {
    console.error('PATCH /api/users error:', error)
    return errorResponse('Failed to update user status')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (body.action === 'checkStatus') {
      return handleCheckStatus(body)
    }
    
    return handleCreateUser(body)
  } catch (error) {
    console.error('POST /api/users error:', error)
    return errorResponse('Invalid request or server error')
  }
}

async function handleCheckStatus(body: any) {
  const { emailOrPhone, password } = body
  
  if (!emailOrPhone || !password) {
    return errorResponse('Missing required fields: emailOrPhone, password', 400)
  }

  const db = await connectDB()
  const { query } = parseEmailOrPhone(emailOrPhone)
  const user = await db.collection('users').findOne(query)

  if (!user || user.password !== password) {
    return errorResponse('INVALID_CREDENTIALS', 401)
  }

  if (user.status === 'blocked') {
    return errorResponse('ACCOUNT_BLOCKED', 403)
  }

  return successResponse({ userType: user.userType })
}

async function handleCreateUser(body: any) {
  const { name, email, phone, role = 'customer' } = body

  if (!name || !email) {
    return errorResponse('Missing required fields: name, email', 400)
  }

  const db = await connectDB()
  const existingUser = await db.collection('users').findOne({ email })
  
  if (existingUser) {
    return errorResponse('User with this email already exists', 409)
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

  return successResponse({
    data: { 
      id: result.insertedId,
      name,
      email,
      phone,
      role,
      active: true
    }
  }, 201)
}

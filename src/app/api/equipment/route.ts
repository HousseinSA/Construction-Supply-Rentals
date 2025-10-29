import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { createNotification } from '@/lib/notifications'
import { ObjectId } from 'mongodb'
import { getInitialEquipmentStatus, getUsageCategoryFromEquipmentType } from '@/lib/models/equipment'

// GET /api/equipment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const availableOnly = searchParams.get('available') === 'true'

    const db = await connectDB()
    
    // Get excluded category IDs
    const excludedCategories = ['Engins spécialisés', 'Engins légers et auxiliaires']
    const excludedCategoryIds = await db.collection('categories')
      .find({ name: { $in: excludedCategories } })
      .project({ _id: 1 })
      .toArray()
    
    const query: any = { 
      status: 'approved', // Only show approved equipment
      categoryId: { $nin: excludedCategoryIds.map(cat => cat._id) }
    }
    
    if (status) query.status = status
    if (categoryId) query.categoryId = new ObjectId(categoryId)
    if (city) query.location = { $regex: new RegExp(city, 'i') }
    
    // Handle category name parameter
    if (category) {
      const categoryDoc = await db.collection('categories').findOne({ 
        $or: [
          { name: { $regex: new RegExp(category.replace(/-/g, ' '), 'i') } },
          { name: { $regex: new RegExp(category, 'i') } }
        ]
      })
      if (categoryDoc) {
        query.categoryId = categoryDoc._id
      }
    }
    
    let equipment = await db.collection('equipment').find(query).toArray()
    
    // Filter out equipment with pending/active bookings if availableOnly requested
    if (availableOnly) {
      // For now, just check isAvailable field instead of complex booking logic
      equipment = equipment.filter(item => item.isAvailable !== false)
    }
    
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

// POST /api/equipment - Create sophisticated equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      supplierId, name, description, categoryId, equipmentTypeId, 
      pricing, location, images, specifications, usage, creatorRole 
    } = body

    if (!supplierId || !name || !categoryId || !equipmentTypeId || !pricing) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: supplierId, name, categoryId, equipmentTypeId, pricing' 
      }, { status: 400 })
    }

    const db = await connectDB()
    
    // Get equipment type to determine usage category
    const equipmentType = await db.collection('equipmentTypes').findOne({ _id: new ObjectId(equipmentTypeId) })
    if (!equipmentType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Equipment type not found' 
      }, { status: 404 })
    }

    const usageCategory = getUsageCategoryFromEquipmentType(equipmentType.name)
    const status = getInitialEquipmentStatus(creatorRole)

    const result = await db.collection('equipment').insertOne({
      supplierId: new ObjectId(supplierId),
      name,
      description: description || '',
      categoryId: new ObjectId(categoryId),
      equipmentTypeId: new ObjectId(equipmentTypeId),
      pricing,
      location: location || '',
      images: images || [],
      specifications: specifications || {},
      usage: usage || {},
      usageCategory,
      status,
      isAvailable: true,
      createdBy: new ObjectId(supplierId),
      ...(status === 'approved' && { approvedAt: new Date() }),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Create notification if supplier created equipment
    if (creatorRole === 'supplier') {
      await createNotification(
        'new_equipment',
        'New Equipment Pending Approval',
        `New equipment "${name}" added by supplier - requires approval`,
        result.insertedId
      )
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: result.insertedId,
        name,
        status,
        usageCategory,
        isAvailable: true
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create equipment' 
    }, { status: 500 })
  }
}

// PUT /api/equipment - Update equipment status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipmentId, status, adminId } = body

    if (!equipmentId || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: equipmentId, status' 
      }, { status: 400 })
    }

    const db = await connectDB()
    const updateData: any = { status, updatedAt: new Date() }
    
    if (status === 'approved' && adminId) {
      updateData.approvedBy = new ObjectId(adminId)
      updateData.approvedAt = new Date()
    }

    await db.collection('equipment').updateOne(
      { _id: new ObjectId(equipmentId) },
      { $set: updateData }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Equipment status updated successfully'
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update equipment status' 
    }, { status: 500 })
  }
}
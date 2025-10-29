import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// GET /api/equipment/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid equipment ID'
      }, { status: 400 })
    }

    const db = await connectDB()
    
    const equipment = await db.collection('equipment').findOne({
      _id: new ObjectId(id),
      status: 'approved' // Only show approved equipment
    })

    if (!equipment) {
      return NextResponse.json({
        success: false,
        error: 'Equipment not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: equipment
    })
  } catch (error) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch equipment'
    }, { status: 500 })
  }
}
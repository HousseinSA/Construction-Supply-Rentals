import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await connectDB()
    
    // Get all categories with equipment type counts (excluding specific categories)
    const excludedCategories = ['Engins spécialisés', 'Engins légers et auxiliaires']
    
    const categories = await db.collection('categories').aggregate([
      {
        $match: {
          name: { $nin: excludedCategories }
        }
      },
      {
        $lookup: {
          from: 'equipmentTypes',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'equipmentTypes'
        }
      },
      {
        $addFields: {
          equipmentTypeCount: { $size: '$equipmentTypes' }
        }
      },
      {
        $project: {
          name: 1,
          nameAr: 1,
          nameFr: 1,
          slug: 1,
          equipmentTypeCount: 1
        }
      },
      {
        $sort: { name: 1 }
      }
    ]).toArray()

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
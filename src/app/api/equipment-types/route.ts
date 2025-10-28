import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    
    const db = await connectDB()
    
    // Get excluded category IDs
    const excludedCategories = ['Engins spécialisés', 'Engins légers et auxiliaires']
    const excludedCategoryIds = await db.collection('categories')
      .find({ name: { $in: excludedCategories } })
      .project({ _id: 1 })
      .toArray()
    
    const query = categoryId 
      ? { categoryId: new ObjectId(categoryId), isActive: true }
      : { 
          isActive: true,
          categoryId: { $nin: excludedCategoryIds.map(cat => cat._id) }
        }
    
    const equipmentTypes = await db.collection('equipmentTypes')
      .find(query)
      .sort({ name: 1 })
      .toArray()
    
    return NextResponse.json(equipmentTypes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch equipment types' }, { status: 500 })
  }
}
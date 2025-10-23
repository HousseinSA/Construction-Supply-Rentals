import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    
    const db = await connectDB()
    const query = categoryId 
      ? { categoryId: new ObjectId(categoryId), isActive: true }
      : { isActive: true }
    
    const equipmentTypes = await db.collection('equipmentTypes')
      .find(query)
      .sort({ name: 1 })
      .toArray()
    
    return NextResponse.json(equipmentTypes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch equipment types' }, { status: 500 })
  }
}
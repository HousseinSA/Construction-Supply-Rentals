import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await connectDB()
    
    const equipmentType = await db.collection('equipmentTypes').findOne({
      _id: new ObjectId(params.id)
    })
    
    if (!equipmentType) {
      return NextResponse.json(
        { success: false, error: "Equipment type not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: equipmentType
    })
  } catch (error) {
    console.error("Error fetching equipment type:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
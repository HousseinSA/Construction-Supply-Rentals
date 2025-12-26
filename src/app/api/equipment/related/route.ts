import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get("id")
    const limit = parseInt(searchParams.get("limit") || "6")

    if (!equipmentId || !ObjectId.isValid(equipmentId)) {
      return NextResponse.json({ success: false, error: "Invalid equipment ID" })
    }

    const db = await connectDB()
    const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(equipmentId) })
    
    if (!equipment) {
      return NextResponse.json({ success: false, error: "Equipment not found" })
    }

    const sameCategory = await db.collection("equipment").find({
      _id: { $ne: new ObjectId(equipmentId) },
      categoryId: equipment.categoryId,
      status: "approved",
      isAvailable: true,
      listingType: "forRent"
    }).limit(limit).toArray()

    let result = sameCategory

    if (result.length < limit) {
      const others = await db.collection("equipment").find({
        _id: { $ne: new ObjectId(equipmentId) },
        categoryId: { $ne: equipment.categoryId },
        status: "approved",
        isAvailable: true,
        listingType: "forRent"
      }).limit(limit - result.length).toArray()
      
      result = [...result, ...others]
    }

    return NextResponse.json({ success: true, equipment: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch equipment" })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await connectDB()
    
    const equipment = await db
      .collection("equipment")
      .find({
        name: { $regex: /porte-char|porte char/i },
        status: "approved",
        isAvailable: true,
        listingType: "forRent"
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      equipment,
    })
  } catch (error) {
    console.error("Error fetching transport equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transport equipment" },
      { status: 500 }
    )
  }
}

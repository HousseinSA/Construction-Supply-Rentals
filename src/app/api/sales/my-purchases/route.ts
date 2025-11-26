import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectDB()

    const purchases = await db
      .collection("sales")
      .find({ buyerId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: purchases })
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch purchases" }, { status: 500 })
  }
}

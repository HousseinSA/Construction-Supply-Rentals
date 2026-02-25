import { NextResponse } from "next/server"
import clientPromise from "@/src/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const client = await clientPromise
    const db = client.db("construction_rental")

    let query: any = {}

    if (session?.user?.role === "supplier") {
      query = { supplierId: session.user.id }
    }

    const locations = await db
      .collection("equipment")
      .distinct("location", query)
    return NextResponse.json({
      success: true,
      data: locations.filter(Boolean).sort(),
    })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" },
      { status: 500 },
    )
  }
}

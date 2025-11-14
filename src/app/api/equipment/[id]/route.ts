import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get("admin") === "true"

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const query: any = { _id: new ObjectId(id) }
    if (!isAdmin) {
      query.status = "approved"
    }

    const equipment = await db.collection("equipment").findOne(query)

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: equipment })
  } catch (error) {
    console.error("Error fetching equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch equipment" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const updateData: any = { updatedAt: new Date() }

    if (body.hasOwnProperty("isAvailable")) {
      updateData.isAvailable = body.isAvailable
    }

    if (body.status) {
      updateData.status = body.status
      if (body.status === "approved") {
        updateData.approvedAt = new Date()
      }
    }

    await db.collection("equipment").updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update equipment" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const updateData: any = {
      description: body.description,
      categoryId: new ObjectId(body.categoryId),
      equipmentTypeId: new ObjectId(body.equipmentTypeId),
      pricing: body.pricing,
      location: body.location,
      images: body.images,
      specifications: body.specifications,
      listingType: body.listingType,
      updatedAt: new Date()
    }

    await db.collection("equipment").updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update equipment" },
      { status: 500 }
    )
  }
}

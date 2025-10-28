import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { COLLECTIONS } from "@/lib/types"

export async function GET() {
  try {
    const db = await connectDB()

    const categories = await db
      .collection(COLLECTIONS.CATEGORIES)
      .aggregate([
        {
          $match: { isActive: true },
        },
        {
          $lookup: {
            from: COLLECTIONS.EQUIPMENT_TYPES,
            localField: "_id",
            foreignField: "categoryId",
            as: "equipmentTypes",
          },
        },
        {
          $addFields: {
            equipmentTypes: {
              $filter: {
                input: "$equipmentTypes",
                cond: { $eq: ["$$this.isActive", true] },
              },
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

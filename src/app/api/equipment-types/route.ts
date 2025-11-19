import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const category = searchParams.get("category")

    const db = await connectDB()

    const excludedCategories = [
      "Engins spécialisés",
      "Engins légers et auxiliaires",
    ]
    const excludedCategoryIds = await db
      .collection("categories")
      .find({ name: { $in: excludedCategories } })
      .project({ _id: 1 })
      .toArray()

    let query: any = { isActive: true }

    if (categoryId) {
      query.categoryId = new ObjectId(categoryId)
    } else if (category) {
      // First try to find by slug, then fallback to name matching
      const categoryDoc = await db.collection("categories").findOne({
        $or: [
          { slug: category },
          { name: { $regex: new RegExp(category.replace(/-/g, " "), "i") } },
          { name: { $regex: new RegExp(category, "i") } },
        ],
      })
      if (categoryDoc) {
        query.categoryId = categoryDoc._id
      } else {
      }
    } else {
      query.categoryId = { $nin: excludedCategoryIds.map((cat) => cat._id) }
    }

    const equipmentTypes = await db
      .collection("equipmentTypes")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "equipment",
            localField: "_id",
            foreignField: "equipmentTypeId",
            as: "equipment",
          },
        },
        {
          $addFields: {
            equipmentCount: {
              $size: {
                $filter: {
                  input: "$equipment",
                  cond: { $ne: ["$$this.listingType", "forSale"] }
                }
              }
            },
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            equipmentCount: 1,
            categoryId: 1,
          },
        },
        { $sort: { name: 1 } },
      ])
      .toArray()
    return NextResponse.json({ success: true, data: equipmentTypes })
  } catch (error) {
    console.error("[Equipment Types API] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch equipment types",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

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

    // Get active bookings (pending or paid)
    const activeBookings = await db
      .collection("bookings")
      .find({ status: { $in: ["pending", "paid"] } })
      .toArray()

    // Extract equipment IDs from active bookings
    const bookedEquipmentIds = new Set(
      activeBookings.flatMap((booking) =>
        booking.bookingItems.map((item: any) => item.equipmentId.toString())
      )
    )

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
            pricingTypes: 1,
            equipment: 1,
          },
        },
        { $sort: { name: 1 } },
      ])
      .toArray()

    // Filter out booked equipment from the count
    const equipmentTypesWithAvailableCount = equipmentTypes.map((type: any) => {
      // Count only forRent equipment that is not currently booked
      const forRentEquipment = type.equipment?.filter((eq: any) => 
        eq.listingType !== "forSale"
      ) || []
      
      const bookedCount = forRentEquipment.filter((eq: any) => 
        bookedEquipmentIds.has(eq._id.toString())
      ).length
      
      const availableCount = forRentEquipment.length - bookedCount
      
      const { equipment, ...typeWithoutEquipment } = type
      return {
        ...typeWithoutEquipment,
        equipmentCount: Math.max(0, availableCount)
      }
    })
    return NextResponse.json({ success: true, data: equipmentTypesWithAvailableCount })
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

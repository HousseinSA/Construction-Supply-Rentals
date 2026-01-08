import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get("id")
    const limit = parseInt(searchParams.get("limit") || "6")
    const type = searchParams.get("type") || "booking"

    if (!equipmentId || !ObjectId.isValid(equipmentId)) {
      return NextResponse.json({ success: false, error: "Invalid equipment ID" })
    }

    const db = await connectDB()
    const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(equipmentId) })
    
    if (!equipment) {
      return NextResponse.json({ success: false, error: "Equipment not found" })
    }

    // Optimized: Get all unavailable equipment IDs in one aggregation
    const unavailableIds = await db.collection("equipment").aggregate([
      {
        $facet: {
          bookedEquipment: [
            { $lookup: { from: "bookings", pipeline: [{ $match: { status: { $in: ["pending", "paid"] } } }], as: "bookings" } },
            { $unwind: "$bookings" },
            { $unwind: "$bookings.bookingItems" },
            { $group: { _id: "$bookings.bookingItems.equipmentId" } }
          ],
          pendingSales: [
            { $lookup: { from: "sales", pipeline: [{ $match: { status: "pending" } }], as: "sales" } },
            { $unwind: "$sales" },
            { $group: { _id: "$sales.equipmentId" } }
          ],
          unavailable: [
            { $match: { isAvailable: false } },
            { $group: { _id: "$_id" } }
          ]
        }
      },
      {
        $project: {
          allIds: { $concatArrays: ["$bookedEquipment", "$pendingSales", "$unavailable"] }
        }
      },
      { $unwind: "$allIds" },
      { $group: { _id: "$allIds._id" } }
    ]).toArray()

    const unavailableEquipmentIds = unavailableIds.map(item => new ObjectId(item._id))

    if (type === "sale") {
      const result = await db.collection("equipment").find({
        _id: { $ne: new ObjectId(equipmentId), $nin: unavailableEquipmentIds },
        status: "approved",
        isAvailable: true,
        listingType: "forSale"
      }).sort({ categoryId: equipment.categoryId ? -1 : 1 }).limit(limit).toArray()

      return NextResponse.json({ success: true, equipment: result })
    } else {
      const result = await db.collection("equipment").aggregate([
        {
          $match: {
            _id: { $ne: new ObjectId(equipmentId), $nin: unavailableEquipmentIds },
            status: "approved",
            isAvailable: true
          }
        },
        {
          $addFields: {
            priority: {
              $switch: {
                branches: [
                  { case: { $and: [{ $eq: ["$categoryId", equipment.categoryId] }, { $eq: ["$listingType", "forRent"] }] }, then: 1 },
                  { case: { $eq: ["$listingType", "forRent"] }, then: 2 },
                  { case: { $eq: ["$categoryId", equipment.categoryId] }, then: 3 }
                ],
                default: 4
              }
            }
          }
        },
        { $sort: { priority: 1 } },
        { $limit: limit },
        { $project: { priority: 0 } }
      ]).toArray()

      return NextResponse.json({ success: true, equipment: result })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch equipment" })
  }
}

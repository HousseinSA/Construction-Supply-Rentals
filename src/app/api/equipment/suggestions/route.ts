import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

async function getUnavailableEquipmentIds(db: any) {
  const unavailableIds = await db
    .collection("equipment")
    .aggregate([
      {
        $facet: {
          pendingSales: [
            {
              $lookup: {
                from: "sales",
                pipeline: [{ $match: { status: "pending" } }],
                as: "sales",
              },
            },
            { $unwind: "$sales" },
            { $group: { _id: "$sales.equipmentId" } },
          ],
          unavailable: [
            { $match: { isAvailable: false } },
            { $group: { _id: "$_id" } },
          ],
        },
      },
      {
        $project: {
          allIds: {
            $concatArrays: [
              "$pendingSales",
              "$unavailable",
            ],
          },
        },
      },
      { $unwind: "$allIds" },
      { $group: { _id: "$allIds._id" } },
    ])
    .toArray()

  return unavailableIds.map((item) => new ObjectId(item._id))
}

async function fetchRelatedEquipment(
  db: any,
  equipmentId: string,
  unavailableIds: ObjectId[],
  offset: number,
  limit: number,
) {
  const equipment = await db
    .collection("equipment")
    .findOne({ _id: new ObjectId(equipmentId) })

  if (!equipment) {
    return { equipment: [], hasMore: false }
  }

  const result = await db
    .collection("equipment")
    .aggregate([
      {
        $match: {
          _id: { $ne: new ObjectId(equipmentId), $nin: unavailableIds },
          status: "approved",
          isAvailable: true,
        },
      },
      {
        $addFields: {
          priority: {
            $switch: {
              branches: [
                {
                  case: {
                    $and: [
                      { $eq: ["$categoryId", equipment.categoryId] },
                      { $eq: ["$listingType", "forRent"] },
                    ],
                  },
                  then: 1,
                },
                {
                  case: { $eq: ["$listingType", "forRent"] },
                  then: 2,
                },
                {
                  case: { $eq: ["$categoryId", equipment.categoryId] },
                  then: 3,
                },
              ],
              default: 4,
            },
          },
        },
      },
      { $sort: { priority: 1 } },
      { $skip: offset },
      { $limit: limit },
      { $project: { priority: 0 } },
    ])
    .toArray()

  return {
    equipment: result,
    hasMore: result.length === limit,
  }
}

async function fetchPopularEquipment(
  db: any,
  unavailableIds: ObjectId[],
  offset: number,
  limit: number,
) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const bookingStats = await db
    .collection("bookings")
    .aggregate([
      {
        $match: {
          status: { $in: ["paid", "completed"] },
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      { $unwind: "$bookingItems" },
      {
        $group: {
          _id: "$bookingItems.equipmentId",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $skip: offset },
      { $limit: limit },
    ])
    .toArray()

  if (bookingStats.length === 0) {
    const fallbackEquipment = await db
      .collection("equipment")
      .find({
        _id: { $nin: unavailableIds },
        status: "approved",
        isAvailable: true,
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray()

    return {
      equipment: fallbackEquipment,
      hasMore: fallbackEquipment.length === limit,
    }
  }

  const equipmentIds = bookingStats.map((s) => new ObjectId(s._id))
  const equipment = await db
    .collection("equipment")
    .find({
      _id: { $in: equipmentIds, $nin: unavailableIds },
      status: "approved",
      isAvailable: true,
    })
    .toArray()

  const sortedEquipment = equipmentIds
    .map((id) => equipment.find((e) => e._id.toString() === id.toString()))
    .filter(Boolean)

  return {
    equipment: sortedEquipment,
    hasMore: sortedEquipment.length === limit,
  }
}

async function fetchTransportEquipment(
  db: any,
  unavailableIds: ObjectId[],
  offset: number,
  limit: number,
) {
  const equipment = await db
    .collection("equipment")
    .find({
      name: { $regex: /porte-char|porte char/i },
      _id: { $nin: unavailableIds },
      status: "approved",
      isAvailable: true,
      listingType: "forRent",
    })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .toArray()

  return {
    equipment,
    hasMore: equipment.length === limit,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get("equipmentId")
    const needsTransport = searchParams.get("needsTransport") === "true"

    const relatedOffset = parseInt(searchParams.get("relatedOffset") || "0")
    const transportOffset = parseInt(searchParams.get("transportOffset") || "0")
    const limit = 12

    if (!equipmentId || !ObjectId.isValid(equipmentId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid equipment ID",
      })
    }

    const db = await connectDB()

    const unavailableIds = await getUnavailableEquipmentIds(db)

    const [related, transport] = await Promise.all([
      fetchRelatedEquipment(
        db,
        equipmentId,
        unavailableIds,
        relatedOffset,
        limit,
      ),
      needsTransport
        ? fetchTransportEquipment(db, unavailableIds, transportOffset, limit)
        : Promise.resolve({ equipment: [], hasMore: false }),
    ])

    return NextResponse.json({
      success: true,
      related: {
        equipment: related.equipment,
        hasMore: related.hasMore,
      },
      transport: {
        equipment: transport.equipment,
        hasMore: transport.hasMore,
      },
    })
  } catch (error) {
    console.error("Error fetching equipment suggestions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch equipment suggestions" },
      { status: 500 },
    )
  }
}

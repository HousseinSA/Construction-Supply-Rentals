import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const db = await connectDB();
    
    // Fetch all porte-char equipment that are:
    // 1. Approved
    // 2. Available
    // 3. For rent (not for sale)
    // 4. Have kmRate pricing
    const porteChars = await db
      .collection("equipment")
      .aggregate([
        {
          $match: {
            name: { $regex: /porte-char|porte char/i },
            status: "approved",
            isAvailable: true,
            listingType: "forRent",
            "pricing.kmRate": { $exists: true, $gt: 0 },
          },
        },
        {
          $lookup: {
            from: "bookings",
            let: { equipmentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $or: [
                          {
                            $in: [
                              "$$equipmentId",
                              "$bookingItems.equipmentId",
                            ],
                          },
                          { $eq: ["$transportDetails.porteCharId", "$$equipmentId"] },
                        ],
                      },
                      { $eq: ["$status", "pending"] },
                    ],
                  },
                },
              },
            ],
            as: "pendingBookings",
          },
        },
        {
          $lookup: {
            from: "sales",
            let: { equipmentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $or: [
                          { $eq: ["$equipmentId", "$$equipmentId"] },
                          { $eq: ["$transportDetails.porteCharId", "$$equipmentId"] },
                        ],
                      },
                      { $eq: ["$status", "pending"] },
                    ],
                  },
                },
              },
            ],
            as: "pendingSales",
          },
        },
        {
          $match: {
            pendingBookings: { $size: 0 },
            pendingSales: { $size: 0 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "supplierId",
            foreignField: "_id",
            as: "supplier",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            "pricing.kmRate": 1,
            supplierId: 1,
            supplierName: {
              $cond: {
                if: { $eq: ["$createdBy", "admin"] },
                then: null,
                else: {
                  $concat: [
                    { $arrayElemAt: ["$supplier.firstName", 0] },
                    " ",
                    { $arrayElemAt: ["$supplier.lastName", 0] },
                  ],
                },
              },
            },
            createdBy: 1,
          },
        },
        {
          $sort: {
            createdBy: -1, // Admin's porte-chars first
            "pricing.kmRate": 1, // Then sort by lowest rate
          },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      porteChars,
    });
  } catch (error) {
    console.error("Error fetching porte-chars:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch porte-chars" },
      { status: 500 }
    );
  }
}

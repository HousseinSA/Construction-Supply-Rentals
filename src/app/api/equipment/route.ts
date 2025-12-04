import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { createNotification } from "@/src/lib/notifications"
import { ObjectId } from "mongodb"
import { triggerRealtimeUpdate } from "@/src/lib/realtime-trigger"
import {
  getInitialEquipmentStatus,
  getUsageCategoryFromEquipmentType,
} from "@/src/lib/models/equipment"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

// GET /api/equipment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const categoryId = searchParams.get("categoryId")
    const category = searchParams.get("category")
    const type = searchParams.get("type")
    const city = searchParams.get("city")
    const listingType = searchParams.get("listingType")
    const availableOnly = searchParams.get("available") === "true"
    const isAdmin = searchParams.get("admin") === "true"

    const db = await connectDB()

    // Get excluded category IDs
    const excludedCategories = [
      "Engins spécialisés",
      "Engins légers et auxiliaires",
    ]
    const excludedCategoryIds = await db
      .collection("categories")
      .find({ name: { $in: excludedCategories } })
      .project({ _id: 1 })
      .toArray()

    const query: any = {
      categoryId: { $nin: excludedCategoryIds.map((cat) => cat._id) },
    }

    // For admin, show all equipment; for others, only approved
    if (!isAdmin) {
      query.status = "approved"
    }

    if (status) query.status = status
    if (categoryId) query.categoryId = new ObjectId(categoryId)
    if (type) query.equipmentTypeId = new ObjectId(type)
    if (availableOnly) query.isAvailable = true
    // Only filter by city if showing equipment for rent
    if (city && listingType !== "forSale")
      query.location = { $regex: new RegExp(city, "i") }

    if ((city || type) && !listingType) {
      query.listingType = "forRent"
    } else if (listingType) {
      query.listingType = listingType
    }

    // Handle category name parameter
    if (category) {
      const categoryDoc = await db.collection("categories").findOne({
        $or: [
          { name: { $regex: new RegExp(category.replace(/-/g, " "), "i") } },
          { name: { $regex: new RegExp(category, "i") } },
        ],
      })
      if (categoryDoc) {
        query.categoryId = categoryDoc._id
      }
    }

    // For non-admin users, filter out equipment with active bookings
    if (!isAdmin) {
      const pipeline: any[] = [
        { $match: query },
        {
          $lookup: {
            from: "bookings",
            let: { equipmentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$$equipmentId", "$bookingItems.equipmentId"] },
                      { $in: ["$status", ["pending", "paid"]] }
                    ]
                  }
                }
              }
            ],
            as: "activeBookings"
          }
        },
        {
          $match: {
            activeBookings: { $size: 0 }
          }
        },
        { $project: { activeBookings: 0 } },
        { $sort: { createdAt: -1 } }
      ]

      const equipment = await db.collection("equipment").aggregate(pipeline).toArray()
      
      return NextResponse.json({
        success: true,
        data: equipment,
        count: equipment.length,
      })
    }

    // For admin, show all equipment without filtering bookings
    const equipment = await db
      .collection("equipment")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      data: equipment,
      count: equipment.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch equipment",
      },
      { status: 500 }
    )
  }
}

// POST /api/equipment - Create sophisticated equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      description,
      categoryId,
      equipmentTypeId,
      pricing,
      location,
      images,
      specifications,
      usage,
      listingType,
    } = body

    // Validate required fields
    if (!categoryId || !equipmentTypeId || !pricing || !location) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: categoryId, equipmentTypeId, pricing, location",
        },
        { status: 400 }
      )
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(categoryId) || !ObjectId.isValid(equipmentTypeId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid category or equipment type ID",
        },
        { status: 400 }
      )
    }

    const db = await connectDB()

    // Get equipment type to determine usage category
    const equipmentType = await db
      .collection("equipmentTypes")
      .findOne({ _id: new ObjectId(equipmentTypeId) })
    if (!equipmentType) {
      return NextResponse.json(
        {
          success: false,
          error: "Equipment type not found",
        },
        { status: 404 }
      )
    }

    // Validate images (minimum 1, maximum 5)
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one image is required",
        },
        { status: 400 }
      )
    }

    if (images.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum 5 images allowed",
        },
        { status: 400 }
      )
    }

    // Get session to determine user role and ID
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userRole = session.user.role || "user"
    const userType = session.user.userType || "supplier"

    // Validate user ID format
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user session",
        },
        { status: 401 }
      )
    }

    const usageCategory = getUsageCategoryFromEquipmentType(equipmentType.name)
    const status = getInitialEquipmentStatus(userRole as "admin" | "user")

    const equipmentName = equipmentType.name

    const result = await db.collection("equipment").insertOne({
      supplierId: new ObjectId(userId),
      name: equipmentName,
      description: description || "",
      categoryId: new ObjectId(categoryId),
      equipmentTypeId: new ObjectId(equipmentTypeId),
      pricing,
      location,
      images,
      specifications: specifications || {},
      usage: usage || {},
      usageCategory,
      status,
      isAvailable: true,
      listingType: listingType || "forRent",
      createdBy: userRole === "admin" ? "admin" : (userType === "supplier" ? "supplier" : "admin"),
      createdById: new ObjectId(userId),
      ...(status === "approved" && { approvedAt: new Date() }),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // Create notification if supplier created equipment
    if (userType === "supplier") {
      try {
        await createNotification(
          "new_equipment",
          "New Equipment Pending Approval",
          `New equipment "${equipmentName}" added by supplier - requires approval`,
          result.insertedId
        )
      } catch (notificationError) {
        console.error("Notification creation failed:", notificationError)
        // Continue without failing the equipment creation
      }
    }

    await triggerRealtimeUpdate('equipment')

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertedId,
          name: equipmentName,
          status,
          usageCategory,
          isAvailable: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Equipment creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create equipment",
      },
      { status: 500 }
    )
  }
}

// PUT /api/equipment - Update equipment status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipmentId, status, adminId } = body

    if (!equipmentId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: equipmentId, status",
        },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const updateData: any = { status, updatedAt: new Date() }

    if (status === "approved" && adminId) {
      updateData.approvedBy = new ObjectId(adminId)
      updateData.approvedAt = new Date()
    }

    await db
      .collection("equipment")
      .updateOne({ _id: new ObjectId(equipmentId) }, { $set: updateData })

    await triggerRealtimeUpdate('equipment')

    return NextResponse.json({
      success: true,
      message: "Equipment status updated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update equipment status",
      },
      { status: 500 }
    )
  }
}

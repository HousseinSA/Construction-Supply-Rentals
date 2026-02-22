import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import {
  getInitialEquipmentStatus,
  getUsageCategoryFromEquipmentType,
} from "@/src/lib/models/equipment"
import { generateReferenceNumber } from "@/src/lib/reference-number"
import {
  buildEquipmentQuery,
  errorResponse,
  successResponse,
  validateObjectIds,
  getAuthenticatedUser,
  requireAdmin,
  sendNewEquipmentNotification,
  getBatchBookingStatus
} from "@/src/lib/api-helpers"


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const db = await connectDB()

    const query = await buildEquipmentQuery(db, {
      status: searchParams.get("status"),
      categoryId: searchParams.get("categoryId"),
      category: searchParams.get("category"),
      type: searchParams.get("type"),
      city: searchParams.get("city"),
      listingType: searchParams.get("listingType"),
      availableOnly: searchParams.get("available") === "true" ? true : searchParams.get("available") === "false" ? false : undefined,
      isAdmin: searchParams.get("admin") === "true",
      supplierId: searchParams.get("supplierId"),
      search: searchParams.get("search"),
      hasPendingPricing: searchParams.get("hasPendingPricing"),
      excludeSold: searchParams.get("excludeSold"),
    })

    const isAdmin = searchParams.get("admin") === "true"
    const includeSupplier = searchParams.get("includeSupplier") === "true"

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    if (!isAdmin) {
      const equipment = await db
        .collection("equipment")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()

      const totalCount = await db.collection("equipment").countDocuments(query)

      return successResponse({
        data: equipment,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      })
    }

    let equipment
    if (includeSupplier) {
      equipment = await db
        .collection("equipment")
        .aggregate([
          { $match: query },
          {
            $lookup: {
              from: "users",
              localField: "supplierId",
              foreignField: "_id",
              as: "supplierData",
            },
          },
          {
            $addFields: {
              supplier: {
                $cond: {
                  if: { $eq: ["$createdBy", "supplier"] },
                  then: { $arrayElemAt: ["$supplierData", 0] },
                  else: null,
                },
              },
            },
          },
          { $project: { supplierData: 0 } },
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit }
        ])
        .toArray()
    } else {
      equipment = await db
        .collection("equipment")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    }

    const equipmentIds = equipment.map((item) => item._id)
    const bookingStatusMap = await getBatchBookingStatus(db, equipmentIds)

    const equipmentWithBookingStatus = equipment.map((item) => {
      const status = bookingStatusMap.get(item._id.toString()) || {
        hasActiveBookings: false,
        hasPendingSale: false
      }
      return {
        ...item,
        ...status
      }
    })

    const totalCount = await db.collection("equipment").countDocuments(query)

    return successResponse({
      data: equipmentWithBookingStatus,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
  } catch (error) {
    return errorResponse("Failed to fetch equipment")
  }
}

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

    if (!categoryId || !equipmentTypeId || !pricing || !location) {
      return errorResponse(
        "Missing required fields: categoryId, equipmentTypeId, pricing, location",
        400
      )
    }

    if (listingType === "forSale" && (!specifications || !specifications.condition)) {
      return errorResponse("Condition is required for sale equipment", 400)
    }

    const validation = validateObjectIds({ categoryId, equipmentTypeId })
    if (!validation.valid) return validation.error

    const db = await connectDB()

    const equipmentType = await db
      .collection("equipmentTypes")
      .findOne({ _id: new ObjectId(equipmentTypeId) })
    if (!equipmentType) {
      return errorResponse("Equipment type not found", 404)
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return errorResponse("At least one image is required", 400)
    }

    if (images.length > 10) {
      return errorResponse("Maximum 10 images allowed", 400)
    }

    const auth = await getAuthenticatedUser()
    if (!auth.authenticated) return auth.error

    const userId = auth.user!.id
    const userRole = auth.user!.role
    const userType = auth.user!.userType

    const usageCategory = getUsageCategoryFromEquipmentType(equipmentType.name)
    const status = getInitialEquipmentStatus(userRole as "admin" | "user")

    const equipmentName = equipmentType.name
    const referenceNumber = await generateReferenceNumber("equipment")

    const result = await db.collection("equipment").insertOne({
      referenceNumber,
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
      createdBy:
        userRole === "admin"
          ? "admin"
          : userType === "supplier"
          ? "supplier"
          : "admin",
      createdById: new ObjectId(userId),
      ...(status === "approved" && { approvedAt: new Date() }),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    if (userRole !== "admin" && userType === "supplier") {
      await sendNewEquipmentNotification(db, {
        equipmentName,
        userId,
        categoryId,
        location,
        pricing,
        listingType
      })
    }

    return successResponse(
      {
        data: {
          id: result.insertedId,
          name: equipmentName,
          status,
          usageCategory,
          isAvailable: true
        }
      },
      201
    )
  } catch (error) {
    console.error("Equipment creation error:", error)
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create equipment"
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipmentId, status, adminId } = body

    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.error

    if (!equipmentId || !status) {
      return errorResponse("Missing required fields: equipmentId, status", 400)
    }

    const validation = validateObjectIds({ equipmentId })
    if (!validation.valid) return validation.error

    const db = await connectDB()
    const updateData: any = { status, updatedAt: new Date() }

    if (status === "approved" && adminId) {
      updateData.approvedBy = new ObjectId(adminId)
      updateData.approvedAt = new Date()
    }

    const result = await db
      .collection("equipment")
      .updateOne({ _id: new ObjectId(equipmentId) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return errorResponse("Equipment not found", 404)
    }

    return successResponse({ message: "Equipment status updated successfully" })
  } catch (error) {
    console.error("Equipment status update error:", error)
    return errorResponse("Failed to update equipment status")
  }
}

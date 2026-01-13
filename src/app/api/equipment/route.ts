import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { triggerRealtimeUpdate } from "@/src/lib/realtime-trigger"
import {
  getInitialEquipmentStatus,
  getUsageCategoryFromEquipmentType,
} from "@/src/lib/models/equipment"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { generateReferenceNumber } from "@/src/lib/reference-number"


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
    const supplierId = searchParams.get("supplierId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

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

    const query: any = {
      categoryId: { $nin: excludedCategoryIds.map((cat) => cat._id) },
    }

    if (!isAdmin && !supplierId) {
      query.status = "approved"
      query.isAvailable = true
    }

    if (supplierId && ObjectId.isValid(supplierId)) {
      query.supplierId = new ObjectId(supplierId)
    }

    if (status) query.status = status
    if (categoryId) query.categoryId = new ObjectId(categoryId)
    if (type) query.equipmentTypeId = new ObjectId(type)
    if (availableOnly) query.isAvailable = true
    if (city && listingType !== "forSale")
      query.location = { $regex: new RegExp(city, "i") }

    if ((city || type) && !listingType) {
      query.listingType = "forRent"
    } else if (listingType) {
      query.listingType = listingType
    }

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

    if (!isAdmin) {
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
    }

    const equipment = await db
      .collection("equipment")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    const equipmentWithBookingStatus = await Promise.all(
      equipment.map(async (item) => {
        const hasActiveBookings = await db.collection("bookings").findOne({
          "bookingItems.equipmentId": item._id,
          status: { $in: ["pending", "paid"] }
        })
        const hasPendingSale = await db.collection("sales").findOne({
          equipmentId: item._id,
          status: { $in: ["pending", "paid"] }
        })
        return {
          ...item,
          hasActiveBookings: !!hasActiveBookings,
          hasPendingSale: !!hasPendingSale
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: equipmentWithBookingStatus,
      count: equipmentWithBookingStatus.length,
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
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: categoryId, equipmentTypeId, pricing, location",
        },
        { status: 400 }
      )
    }

    if (listingType === "forSale" && (!specifications || !specifications.condition)) {
      return NextResponse.json(
        {
          success: false,
          error: "Condition is required for sale equipment",
        },
        { status: 400 }
      )
    }

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

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one image is required",
        },
        { status: 400 }
      )
    }

    if (images.length > 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum 10 images allowed",
        },
        { status: 400 }
      )
    }

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
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        try {
          const supplier = await db
            .collection("users")
            .findOne({ _id: new ObjectId(userId) })
          const category = await db
            .collection("categories")
            .findOne({ _id: new ObjectId(categoryId) })
          let pricingText = ""
          if (listingType === "forSale" && pricing.salePrice) {
            pricingText = `${pricing.salePrice.toFixed(2)} MRU`
          } else {
            const prices = []
            if (pricing.hourlyRate)
              prices.push(`${pricing.hourlyRate} MRU / heure`)
            if (pricing.dailyRate)
              prices.push(`${pricing.dailyRate} MRU / jour`)
            if (pricing.kmRate) prices.push(`${pricing.kmRate} MRU / km`)
            if (pricing.tonRate) prices.push(`${pricing.tonRate} MRU / tonne`)
            pricingText = prices.join(", ")
          }

          const { sendNewEquipmentEmail } = await import("@/src/lib/email")
          await sendNewEquipmentEmail(adminEmail, {
            equipmentName,
            supplierName: supplier
              ? `${supplier.firstName} ${supplier.lastName}`
              : "Unknown",
            supplierPhone: supplier?.phone || "N/A",
            location,
            category: category?.name || undefined,
            listingType: listingType === "forSale" ? "Vente" : "Location",
            pricing: pricingText,
            dateSubmitted: new Date(),
          })
        } catch (emailError) {
          console.error("Email error:", emailError)
        }
      }
    }

    await triggerRealtimeUpdate("equipment")

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { equipmentId, status, adminId } = body
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin only" },
        { status: 401 }
      )
    }

    if (!equipmentId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: equipmentId, status" },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(equipmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 }
      )
    }

    await triggerRealtimeUpdate("equipment")

    return NextResponse.json({
      success: true,
      message: "Equipment status updated successfully",
    })
  } catch (error) {
    console.error("Equipment status update error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update equipment status" },
      { status: 500 }
    )
  }
}

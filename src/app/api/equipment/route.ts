import { NextRequest } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { generateReferenceNumber } from "@/src/lib/reference-number"
import {
  buildEquipmentQuery,
  errorResponse,
  successResponse,
  validateObjectIds,
  getAuthenticatedUser,
  requireAdmin,
  sendNewEquipmentNotification,
} from "@/src/lib/api-helpers"
import {
  fetchEquipmentWithPagination,
  validateEquipmentCreation,
  buildEquipmentDocument,
} from "@/src/lib/api-helpers/equipment-route-helpers"
import type { EquipmentType } from "@/src/lib/api-helpers/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const db = await connectDB()

    const getParam = (key: string) => searchParams.get(key)
    const getBoolParam = (key: string) => getParam(key) === "true"
    
    const available = getParam("available")
    const isAdmin = getBoolParam("admin")

    const query = await buildEquipmentQuery(db, {
      status: getParam("status"),
      categoryId: getParam("categoryId"),
      type: getParam("type"),
      city: getParam("city"),
      listingType: getParam("listingType"),
      availableOnly: available === "true" ? true : available === "false" ? false : undefined,
      isAdmin,
      supplierId: getParam("supplierId"),
      hasPendingPricing: getParam("hasPendingPricing"),
      excludeSold: getParam("excludeSold"),
      isSold: getParam("isSold"),
    })

    const searchTerm = getParam("search")

    const { equipment, pagination } = await fetchEquipmentWithPagination(db, query, {
      page: parseInt(getParam("page") || "1"),
      limit: parseInt(getParam("limit") || "12"),
      includeSupplier: getBoolParam("includeSupplier"),
      isAdmin
    }, searchTerm || undefined)

    return successResponse({ data: equipment, pagination })
  } catch (error) {
    console.error("[GET /equipment] Error:", error)
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch equipment"
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = validateEquipmentCreation(body)
    if (!validation.valid) return validation.error

    const { categoryId, equipmentTypeId } = body
    const objectIdValidation = validateObjectIds({ categoryId, equipmentTypeId })
    if (!objectIdValidation.valid) return objectIdValidation.error

    const db = await connectDB()

    const equipmentTypeDoc = await db
      .collection("equipmentTypes")
      .findOne({ _id: new ObjectId(equipmentTypeId) })
    if (!equipmentTypeDoc) {
      return errorResponse("Equipment type not found", 404)
    }

    const auth = await getAuthenticatedUser()
    if (!auth.authenticated) return auth.error

    const referenceNumber = await generateReferenceNumber("equipment")
    const equipmentDoc = buildEquipmentDocument(
      body,
      { id: auth.user!.id, role: auth.user!.role, userType: auth.user!.userType },
      equipmentTypeDoc as EquipmentType,
      referenceNumber
    )

    const result = await db.collection("equipment").insertOne(equipmentDoc)

    if (auth.user!.userType === "supplier") {
      await sendNewEquipmentNotification(db, {
        equipmentName: equipmentTypeDoc.name,
        userId: auth.user!.id,
        categoryId: body.categoryId,
        location: body.location,
        pricing: body.pricing,
        listingType: body.listingType
      })
    }

    return successResponse(
      {
        data: {
          id: result.insertedId,
          name: equipmentTypeDoc.name,
          status: equipmentDoc.status,
          usageCategory: equipmentDoc.usageCategory,
          isAvailable: true
        }
      },
      201
    )
  } catch (error) {
    console.error("[POST /equipment] Error:", error)
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

    const validation = validateObjectIds({ equipmentId, ...(adminId && { adminId }) })
    if (!validation.valid) return validation.error

    const db = await connectDB()
    const updateData: Record<string, unknown> = { status, updatedAt: new Date() }

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
    console.error("[PUT /equipment] Error:", error)
    return errorResponse(
      error instanceof Error ? error.message : "Failed to update equipment status"
    )
  }
}

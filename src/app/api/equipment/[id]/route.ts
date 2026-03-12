import { NextRequest } from "next/server"
import { ObjectId } from "mongodb"
import { Equipment, LOCKED_FIELDS_FOR_EDIT } from "@/src/lib/models/equipment"
import {
  validateObjectId,
  errorResponse,
  successResponse,
  getBookingStatusForEquipment,
  getSupplierInfo,
  checkActiveBookingsOrSales,
  validateAndGetEquipmentAccess,
  detectPricingChanges,
  handleAdminPricingUpdate,
  handleSupplierPricingUpdate,
  buildCommonUpdateData,
  handleStatusUpdate,
} from "@/src/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params 
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get("admin") === "true"

    const idValidation = validateObjectId(id, "equipment ID")
    if (!idValidation.valid) return idValidation.error

    const access = await validateAndGetEquipmentAccess(id)
    if ('error' in access) return access.error

    const { db, equipment } = access

    let supplierInfo = null
    if (isAdmin && equipment.supplierId) {
      supplierInfo = await getSupplierInfo(db, equipment.supplierId as ObjectId)
    }

    const bookingStatus = await getBookingStatusForEquipment(
      db,
      id,
      access.userId,
    )

    return successResponse({
      data: {
        ...equipment,
        ...bookingStatus,
        ...(isAdmin && { supplierInfo }),
      },
    })
  } catch (error) {
    console.error("[GET /equipment/:id] Error:", error)
    return errorResponse("Failed to fetch equipment details")
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()

    const access = await validateAndGetEquipmentAccess(id)
    if ('error' in access) return access.error

    const { db, equipment, isAdmin, userId } = access
    const updateData: Partial<Equipment> = { updatedAt: new Date() }

    if (body.hasOwnProperty("isAvailable")) {
      const { hasActiveBookings, hasPendingSale } =
        await checkActiveBookingsOrSales(db, new ObjectId(id))

      if (hasActiveBookings || hasPendingSale) {
        return errorResponse(
          "Cannot change availability - equipment has active bookings or pending sales",
          400,
        )
      }

      updateData.isAvailable = body.isAvailable
      if (!isAdmin && equipment.status === "approved") {
        updateData.status = "approved"
      }
    }

    if (isAdmin && body.status) {
      const statusUpdate = await handleStatusUpdate(
        db,
        equipment,
        body.status,
        userId,
        body.rejectionReason
      )
      Object.assign(updateData, statusUpdate)
    }

    await db
      .collection("equipment")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData })
    return successResponse({})
  } catch (error) {
    console.error("[PATCH /equipment/:id] Error:", error)
    return errorResponse("Failed to update equipment availability/status")
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()

    const access = await validateAndGetEquipmentAccess(id)
    if ('error' in access) return access.error

    const { db, equipment, isAdmin } = access
    const updateData: Partial<Equipment> = { updatedAt: new Date() }

    Object.assign(updateData, buildCommonUpdateData(body))

    if (isAdmin) {
      if (body.pricing !== undefined) {
        Object.assign(updateData, handleAdminPricingUpdate(equipment, body.pricing))
      }

      if (body.isAvailable !== undefined) {
        updateData.isAvailable = body.isAvailable
      }

      for (const field of LOCKED_FIELDS_FOR_EDIT) {
        if (
          body[field] !== undefined &&
          body[field] !== equipment[field]?.toString()
        ) {
          return errorResponse(`Cannot modify locked field: ${field}`, 400)
        }
      }

      updateData.lastEditedAt = new Date()
    } else {
      updateData.lastEditedAt = new Date()

      if (equipment.status === "rejected") {
        updateData.status = "pending"
        updateData.rejectionReason = null
        updateData.rejectedAt = null
      }

      if (body.pricing !== undefined) {
        const pricingUpdate = await handleSupplierPricingUpdate(
          db,
          equipment,
          body.pricing,
          detectPricingChanges
        )
        Object.assign(updateData, pricingUpdate)
      }
    }

    await db
      .collection("equipment")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return successResponse({
      hasPendingPricing: !!updateData.pendingPricing,
    })
  } catch (error) {
    console.error("[PUT /equipment/:id] Error:", error)
    return errorResponse("Failed to update equipment details")
  }
}

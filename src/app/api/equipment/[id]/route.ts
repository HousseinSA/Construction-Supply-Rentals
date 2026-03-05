import { NextRequest } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { Equipment, LOCKED_FIELDS_FOR_EDIT } from "@/src/lib/models/equipment"
import {
  validateObjectId,
  errorResponse,
  successResponse,
  getBookingStatusForEquipment,
  getSupplierInfo,
  checkActiveBookingsOrSales,
  sendEquipmentApprovalNotification,
  detectPricingChanges,
  sendPricingUpdateNotification,
  validateAndGetEquipmentAccess,
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

    const db = await connectDB()
    const query: { _id: ObjectId; status?: string } = {
      _id: new ObjectId(id),
    }
    if (!isAdmin) {
      query.status = "approved"
    }

    const equipment = await db.collection("equipment").findOne(query)

    if (!equipment) {
      return errorResponse("Equipment not found", 404)
    }

    let supplierInfo = null
    if (isAdmin && equipment.supplierId) {
      supplierInfo = await getSupplierInfo(db, equipment.supplierId)
    }

    const session = await getServerSession(authOptions)
    const bookingStatus = await getBookingStatusForEquipment(
      db,
      id,
      session?.user?.id,
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
      updateData.status = body.status
      if (body.status === "approved") {
        updateData.approvedAt = new Date()
        updateData.approvedBy = new ObjectId(userId)
        updateData.rejectionReason = null
        updateData.rejectedAt = null

        await sendEquipmentApprovalNotification(db, equipment)
      } else if (body.status === "rejected") {
        if (!body.rejectionReason || body.rejectionReason.trim() === "") {
          return errorResponse("Rejection reason is required", 400)
        }
        updateData.rejectionReason = body.rejectionReason
        updateData.rejectedAt = new Date()
      }
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

    const { db, equipment, isAdmin, userId } = access
    const updateData: Partial<Equipment> = { updatedAt: new Date() }

    type PricingKey = 'hourlyRate' | 'dailyRate' | 'monthlyRate' | 'kmRate' | 'tonRate' | 'salePrice'

    if (isAdmin) {
      if (body.description !== undefined) updateData.description = body.description
      if (body.images !== undefined) updateData.images = body.images
      if (body.specifications !== undefined) updateData.specifications = body.specifications

      if (body.pricing !== undefined) {
        updateData.pricing = { ...equipment.pricing, ...body.pricing }
        
        if (equipment.pendingPricing) {
          const remainingPending: Partial<Record<PricingKey, number>> = {}
          const keys = Object.keys(equipment.pendingPricing) as PricingKey[]
          keys.forEach((key) => {
            if (!body.pricing.hasOwnProperty(key) && equipment.pendingPricing![key] !== undefined) {
              remainingPending[key] = equipment.pendingPricing![key]
            }
          })
          updateData.pendingPricing = Object.keys(remainingPending).length > 0 ? remainingPending : null
        }
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
      if (body.description !== undefined) updateData.description = body.description
      if (body.images !== undefined) updateData.images = body.images
      if (body.specifications !== undefined) updateData.specifications = body.specifications
      
      updateData.lastEditedAt = new Date()

      if (equipment.status === "rejected") {
        updateData.status = "pending"
        updateData.rejectionReason = null
        updateData.rejectedAt = null
      }

      if (body.pricing !== undefined) {
        const { changedPricing, hasChanges } = detectPricingChanges(
          equipment.pricing,
          body.pricing,
        )

        if (hasChanges) {
          if (equipment.status === "approved") {
            updateData.pendingPricing = equipment.pendingPricing
              ? { ...equipment.pendingPricing, ...changedPricing }
              : changedPricing

            if (
              equipment.pricingRejectionReasons ||
              equipment.rejectedPricingValues
            ) {
              const remainingRejections: Record<string, string> = {}
              const remainingValues: Partial<Record<PricingKey, number>> = {}

              if (equipment.pricingRejectionReasons?._all) {
                let hasUnfixedRejections = false
                const rejectedKeys = Object.keys(equipment.rejectedPricingValues || {}) as PricingKey[]
                rejectedKeys.forEach((key) => {
                  if (!changedPricing.hasOwnProperty(key) && equipment.rejectedPricingValues![key] !== undefined) {
                    hasUnfixedRejections = true
                    remainingValues[key] = equipment.rejectedPricingValues![key]
                  }
                })

                if (hasUnfixedRejections) {
                  remainingRejections._all = equipment.pricingRejectionReasons._all
                }
              }

              if (equipment.pricingRejectionReasons) {
                const rejectionKeys = Object.keys(equipment.pricingRejectionReasons)
                rejectionKeys.forEach((key) => {
                  if (key === "_all") return

                  if (!changedPricing.hasOwnProperty(key)) {
                    remainingRejections[key] = equipment.pricingRejectionReasons![key]
                    const pricingKey = key as PricingKey
                    if (equipment.rejectedPricingValues?.[pricingKey] !== undefined) {
                      remainingValues[pricingKey] = equipment.rejectedPricingValues[pricingKey]
                    }
                  }
                })
              } else if (equipment.rejectedPricingValues) {
                const valueKeys = Object.keys(equipment.rejectedPricingValues) as PricingKey[]
                valueKeys.forEach((key) => {
                  if (!changedPricing.hasOwnProperty(key) && equipment.rejectedPricingValues![key] !== undefined) {
                    remainingValues[key] = equipment.rejectedPricingValues![key]
                  }
                })
              }

              updateData.pricingRejectionReasons =
                Object.keys(remainingRejections).length > 0 ? remainingRejections : null
              updateData.rejectedPricingValues =
                Object.keys(remainingValues).length > 0 ? remainingValues : null
            }

            await sendPricingUpdateNotification(db, equipment, body.pricing)
          } else {
            updateData.pricing = { ...equipment.pricing, ...changedPricing }
            updateData.pendingPricing = null
            updateData.pricingRejectionReasons = null
            updateData.rejectedPricingValues = null
          }
        }
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

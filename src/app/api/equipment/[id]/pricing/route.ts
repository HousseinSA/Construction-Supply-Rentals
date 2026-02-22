import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import {
  requireAdmin,
  validateObjectId,
  errorResponse,
  successResponse,
  sendPricingApprovalNotification,
  sendPricingRejectionNotification
} from "@/src/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, rejectionReason, selectedRates, useAllKey } = body
    
    const adminAuth = await requireAdmin()
    if (!adminAuth.authorized) return adminAuth.error

    const idValidation = validateObjectId(id, "equipment ID")
    if (!idValidation.valid) return idValidation.error

    const db = await connectDB()
    const equipment = await db
      .collection("equipment")
      .findOne({ _id: new ObjectId(id) })

    if (!equipment || !equipment.pendingPricing) {
      return errorResponse("No pending pricing request found", 404)
    }

    if (action === "approve") {
      const pricingUpdate: any = {}
      const remainingPending: any = {}

      selectedRates.forEach((rate: string) => {
        if (equipment.pendingPricing[rate] !== undefined) {
          pricingUpdate[`pricing.${rate}`] = equipment.pendingPricing[rate]
        }
      })

      Object.keys(equipment.pendingPricing).forEach((key) => {
        if (!selectedRates.includes(key)) {
          remainingPending[key] = equipment.pendingPricing[key]
        }
      })

      const updateDoc: any = {
        $set: {
          ...pricingUpdate,
          updatedAt: new Date(),
        },
        $unset: {},
      }

      if (Object.keys(remainingPending).length > 0) {
        updateDoc.$set.pendingPricing = remainingPending
      } else {
        updateDoc.$unset.pendingPricing = ""
      }
      const filterOut = (obj: any, keys: string[]) =>
        obj
          ? Object.fromEntries(
              Object.entries(obj).filter(([k]) => !keys.includes(k)),
            )
          : {}

      const remainingRejectedValues = filterOut(
        equipment.rejectedPricingValues,
        selectedRates,
      )
      const remainingRejectionReasons = filterOut(
        equipment.pricingRejectionReasons,
        selectedRates,
      )

      updateDoc.$set.rejectedPricingValues =
        Object.keys(remainingRejectedValues).length > 0
          ? remainingRejectedValues
          : null
      updateDoc.$set.pricingRejectionReasons =
        Object.keys(remainingRejectionReasons).length > 0
          ? remainingRejectionReasons
          : null
      if (Object.keys(updateDoc.$unset).length === 0) {
        delete updateDoc.$unset
      }
      await db
        .collection("equipment")
        .updateOne({ _id: new ObjectId(id) }, updateDoc)

      await sendPricingApprovalNotification(db, equipment)
    } else if (action === "reject") {
      const rejectionReasons: any = {}
      const rejectedValues: any = {}

      selectedRates.forEach((rate: string) => {
        if (equipment.pendingPricing[rate] !== undefined) {
          rejectedValues[rate] = equipment.pendingPricing[rate]
        }
      })

      if (rejectionReason?.trim()) {
        if (useAllKey) {
          rejectionReasons._all = rejectionReason.trim()
        } else {
          selectedRates.forEach((rate: string) => {
            rejectionReasons[rate] = rejectionReason.trim()
          })
        }
      }

      const remainingPending: any = {}
      Object.keys(equipment.pendingPricing).forEach((key) => {
        if (!selectedRates.includes(key)) {
          remainingPending[key] = equipment.pendingPricing[key]
        }
      })
      const existingRejectedValues = equipment.rejectedPricingValues || {}
      const existingRejectionReasons = equipment.pricingRejectionReasons || {}

      const updateDoc: any = {
        $set: {
          updatedAt: new Date(),
          rejectedPricingValues: {
            ...existingRejectedValues,
            ...rejectedValues,
          },
          ...(Object.keys(rejectionReasons).length > 0 && {
            pricingRejectionReasons: {
              ...existingRejectionReasons,
              ...rejectionReasons,
            },
          }),
        },
      }
      if (Object.keys(remainingPending).length > 0) {
        updateDoc.$set.pendingPricing = remainingPending
      } else {
        updateDoc.$unset = { pendingPricing: "" }
      }
      await db
        .collection("equipment")
        .updateOne({ _id: new ObjectId(id) }, updateDoc)

      await sendPricingRejectionNotification(db, equipment, rejectionReason)
    } else {
      return errorResponse("Invalid action. Use 'approve' or 'reject'", 400)
    }

    return successResponse({ message: `Pricing ${action}d successfully` })
  } catch (error) {
    console.error("Error handling pricing request:", error)
    return errorResponse("Failed to process pricing request")
  }
}

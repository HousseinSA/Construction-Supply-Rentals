import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, rejectionReason, selectedRates, useAllKey } = body
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin only" },
        { status: 401 },
      )
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 },
      )
    }

    const db = await connectDB()
    const equipment = await db
      .collection("equipment")
      .findOne({ _id: new ObjectId(id) })

    if (!equipment || !equipment.pendingPricing) {
      return NextResponse.json(
        { success: false, error: "No pending pricing request found" },
        { status: 404 },
      )
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

      try {
        const supplier = await db
          .collection("users")
          .findOne({ _id: equipment.supplierId })
        if (supplier?.email) {
          const { sendPricingApprovalEmail } = await import("@/src/lib/email")
          await sendPricingApprovalEmail(supplier.email, {
            equipmentName: equipment.name,
            supplierName: `${supplier.firstName} ${supplier.lastName}`,
          })
        }
      } catch (emailError) {
        console.error("Email error:", emailError)
      }
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
      try {
        const supplier = await db
          .collection("users")
          .findOne({ _id: equipment.supplierId })
        if (supplier?.email) {
          const { sendPricingRejectionEmail } = await import("@/src/lib/email")
          await sendPricingRejectionEmail(supplier.email, {
            equipmentName: equipment.name,
            supplierName: `${supplier.firstName} ${supplier.lastName}`,
            rejectionReason,
          })
        }
      } catch (emailError) {
        console.error("Email error:", emailError)
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Pricing ${action}d successfully`,
    })
  } catch (error) {
    console.error("Error handling pricing request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process pricing request" },
      { status: 500 },
    )
  }
}

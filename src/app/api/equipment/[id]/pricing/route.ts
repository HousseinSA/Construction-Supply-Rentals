import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { triggerRealtimeUpdate } from "@/src/lib/realtime-trigger"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, rejectionReason } = body
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin only" },
        { status: 401 }
      )
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid equipment ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(id) })

    if (!equipment || !equipment.pendingPricing) {
      return NextResponse.json(
        { success: false, error: "No pending pricing request found" },
        { status: 404 }
      )
    }

    if (action === "approve") {
      await db.collection("equipment").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            pricing: equipment.pendingPricing,
            updatedAt: new Date()
          },
          $unset: { pendingPricing: "", pricingRejectionReason: "" }
        }
      )
      
      try {
        const supplier = await db.collection("users").findOne({ _id: equipment.supplierId })
        if (supplier?.email) {
          const { sendPricingApprovalEmail } = await import("@/src/lib/email")
          await sendPricingApprovalEmail(supplier.email, {
            equipmentName: equipment.name,
            supplierName: `${supplier.firstName} ${supplier.lastName}`
          })
        }
      } catch (emailError) {
        console.error("Email error:", emailError)
      }
    } else if (action === "reject") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        return NextResponse.json(
          { success: false, error: "Rejection reason is required" },
          { status: 400 }
        )
      }
      await db.collection("equipment").updateOne(
        { _id: new ObjectId(id) },
        {
          $unset: { pendingPricing: "" },
          $set: { 
            pricingRejectionReason: rejectionReason,
            updatedAt: new Date() 
          }
        }
      )
      
      try {
        const supplier = await db.collection("users").findOne({ _id: equipment.supplierId })
        if (supplier?.email) {
          const { sendPricingRejectionEmail } = await import("@/src/lib/email")
          await sendPricingRejectionEmail(supplier.email, {
            equipmentName: equipment.name,
            supplierName: `${supplier.firstName} ${supplier.lastName}`,
            rejectionReason
          })
        }
      } catch (emailError) {
        console.error("Email error:", emailError)
      }
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    await triggerRealtimeUpdate('equipment')
    return NextResponse.json({ 
      success: true,
      message: `Pricing ${action}d successfully`
    })
  } catch (error) {
    console.error("Error handling pricing request:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process pricing request" },
      { status: 500 }
    )
  }
}

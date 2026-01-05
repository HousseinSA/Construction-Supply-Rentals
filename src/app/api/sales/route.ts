import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"
import { triggerRealtimeUpdate } from "@/src/lib/realtime-trigger"
import { generateReferenceNumber } from "@/src/lib/reference-number"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get("skip") || "0")
    const limit = parseInt(searchParams.get("limit") || "50")

    const db = await connectDB()
    const pipeline: any[] = []

    // Role-based filtering for sales
    if (session.user.role === 'admin') {
      // Admin sees all sales
    } else if (session.user.userType === 'supplier') {
      // Suppliers see sales of their own equipment
      pipeline.push({ $match: { supplierId: new ObjectId(session.user.id) } })
    } else {
      // Renters see sales they made as buyers
      pipeline.push({ $match: { buyerId: new ObjectId(session.user.id) } })
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyerInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierInfo",
        },
      },
      {
        $lookup: {
          from: "equipment",
          localField: "equipmentId",
          foreignField: "_id",
          as: "equipmentInfo",
        },
      },
      {
        $addFields: {
          isAdminOwned: {
            $cond: {
              if: { $eq: [{ $arrayElemAt: ["$equipmentInfo.createdBy", 0] }, "admin"] },
              then: true,
              else: false
            }
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    )

    const sales = await db.collection("sales").aggregate(pipeline).toArray()

    // Get total count for pagination info
    const countPipeline = pipeline.slice(0, -2) // Remove $skip and $limit for count
    const totalCountResult = await db.collection("sales").aggregate([...pipeline.slice(0, pipeline.length - 2), { $count: "total" }]).toArray()
    const total = totalCountResult[0]?.total || 0

    return NextResponse.json({
      success: true,
      data: sales,
      count: sales.length,
      total,
      skip,
      limit,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch sales" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyerId, equipmentId, buyerMessage } = body

    if (!buyerId || !equipmentId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const equipment = await db
      .collection("equipment")
      .findOne({ _id: ObjectId.createFromHexString(equipmentId) })

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: "Equipment not found" },
        { status: 404 }
      )
    }

    if (equipment.listingType !== "forSale") {
      return NextResponse.json(
        { success: false, error: "Equipment is not for sale" },
        { status: 400 }
      )
    }

    const salePrice = equipment.pricing?.salePrice || 0
    const commission = salePrice * 0.05
    const grandTotal = salePrice
    const referenceNumber = await generateReferenceNumber('sale')

    const result = await db.collection("sales").insertOne({
      referenceNumber,
      buyerId: ObjectId.createFromHexString(buyerId),
      equipmentId: ObjectId.createFromHexString(equipmentId),
      supplierId: equipment.supplierId && equipment.createdBy !== "admin" ? equipment.supplierId : null,
      equipmentName: equipment.name,
      salePrice,
      commission: equipment.createdBy === "admin" ? 0 : commission,
      grandTotal,
      status: "pending",
      buyerMessage: buyerMessage || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      const buyer = await db
        .collection("users")
        .findOne({ _id: ObjectId.createFromHexString(buyerId) })
      
      let supplierName, supplierPhone;
      if (equipment.supplierId) {
        const supplier = await db.collection("users").findOne({ _id: equipment.supplierId })
        if (supplier) {
          supplierName = `${supplier.firstName} ${supplier.lastName}`
          supplierPhone = supplier.phone
        }
      }
      
      const { sendNewSaleEmail } = await import("@/src/lib/email")
      await sendNewSaleEmail(adminEmail, {
        referenceNumber,
        equipmentName: equipment.name,
        salePrice,
        buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : "Unknown",
        buyerPhone: buyer?.phone || "N/A",
        buyerLocation: buyer?.city || undefined,
        saleDate: new Date(),
        supplierName,
        supplierPhone
      }).catch((err) => console.error("Email error:", err))
    }

    try {
      await db.collection('equipment').updateOne(
        { _id: ObjectId.createFromHexString(equipmentId) },
        { $set: { isAvailable: false, updatedAt: new Date() } }
      )
      await triggerRealtimeUpdate('equipment')
    } catch (e) {
      console.error(e)
    }

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          id: result.insertedId, 
          salePrice, 
          commission,
          equipment: equipment || null,
        } 
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create sale order" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { saleId, status, adminId, adminNotes } = body

    if (!saleId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(saleId)) {
      return NextResponse.json(
        { success: false, error: "Invalid sale ID" },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const saleObjectId = ObjectId.createFromHexString(saleId)
    
    if (status === 'cancelled') {
      const sale = await db.collection('sales').findOne({ _id: saleObjectId })
      if (!sale) {
        return NextResponse.json(
          {
            success: false,
            error: "Sale not found",
          },
          { status: 404 }
        )
      }
      if (sale.status !== 'pending') {
        return NextResponse.json(
          {
            success: false,
            error: "Only pending purchases can be cancelled. Please contact support for assistance.",
          },
          { status: 400 }
        )
      }

      if (!adminId) {
        const adminEmail = process.env.ADMIN_EMAIL
        if (adminEmail) {
          const buyer = await db.collection('users').findOne({ _id: sale.buyerId })
        
        let supplierName, supplierPhone;
        if (sale.supplierId) {
          const supplier = await db.collection('users').findOne({ _id: sale.supplierId })
          if (supplier) {
            supplierName = `${supplier.firstName} ${supplier.lastName}`
            supplierPhone = supplier.phone
          }
        }
        
        const { sendSaleCancellationEmail } = await import('@/src/lib/email')
        await sendSaleCancellationEmail(adminEmail, {
          referenceNumber: sale.referenceNumber,
          equipmentName: sale.equipmentName,
          salePrice: sale.salePrice,
          buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : 'Unknown',
          buyerPhone: buyer?.phone || 'N/A',
          buyerLocation: buyer?.city || undefined,
          cancellationDate: new Date(),
          supplierName,
          supplierPhone
        }).catch((err: any) => console.error('Email error:', err))
      }
      }
    }
    
    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (adminId) {
      updateData.adminHandledBy = ObjectId.createFromHexString(adminId)
      updateData.adminHandledAt = new Date()
    }

    if (adminNotes) updateData.adminNotes = adminNotes
    if (status === "paid") updateData.paidAt = new Date()
    if (status === "completed") updateData.completedAt = new Date()

    await db
      .collection("sales")
      .updateOne({ _id: saleObjectId }, { $set: updateData })

    if (status === "paid") {
      const sale = await db
        .collection("sales")
        .findOne({ _id: saleObjectId })
      if (sale) {
        await db
          .collection("equipment")
          .updateOne(
            { _id: sale.equipmentId },
            { $set: { isAvailable: false, soldViaTransaction: true, updatedAt: new Date() } }
          )
      }
    } else if (status === "cancelled") {
      const sale = await db
        .collection("sales")
        .findOne({ _id: saleObjectId })
      if (sale) {
        await db
          .collection("equipment")
          .updateOne(
            { _id: sale.equipmentId },
            { $set: { isAvailable: true, updatedAt: new Date() } }
          )
      }
    }

    await triggerRealtimeUpdate("sales")
    await triggerRealtimeUpdate("equipment")

    return NextResponse.json({ success: true, message: "Sale status updated" })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update sale" },
      { status: 400 }
    )
  }
}

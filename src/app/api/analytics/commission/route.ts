import { NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"

export async function GET(request: Request) {
  try {
    const db = await connectDB()
    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get("dateFilter") || "last30days"

    const dateRange = getDateRange(dateFilter)

    const [bookings, sales, categories, topBookedEquipment, topSoldEquipment] = await Promise.all([
      db.collection("bookings").aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: dateRange.start, $lte: dateRange.end }
          }
        },
        {
          $unwind: "$bookingItems"
        },
        {
          $lookup: {
            from: "equipment",
            localField: "bookingItems.equipmentId",
            foreignField: "_id",
            as: "equipment"
          }
        },
        {
          $unwind: { path: "$equipment", preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: "categories",
            localField: "equipment.categoryId",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $unwind: { path: "$category", preserveNullAndEmptyArrays: true }
        },
        {
          $group: {
            _id: null,
            totalBookingValue: { $sum: "$bookingItems.subtotal" },
            totalBookings: { $sum: 1 },
            categoryBreakdown: {
              $push: {
                categoryId: "$equipment.categoryId",
                categoryName: "$category.name",
                amount: "$bookingItems.subtotal"
              }
            }
          }
        }
      ]).toArray(),
      db.collection("sales").aggregate([
        {
          $match: {
            status: "paid",
            createdAt: { $gte: dateRange.start, $lte: dateRange.end }
          }
        },
        {
          $lookup: {
            from: "equipment",
            localField: "equipmentId",
            foreignField: "_id",
            as: "equipment"
          }
        },
        {
          $unwind: { path: "$equipment", preserveNullAndEmptyArrays: true }
        },
        {
          $lookup: {
            from: "categories",
            localField: "equipment.categoryId",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $unwind: { path: "$category", preserveNullAndEmptyArrays: true }
        },
        {
          $group: {
            _id: null,
            totalSaleValue: { $sum: "$salePrice" },
            totalSales: { $sum: 1 },
            categoryBreakdown: {
              $push: {
                categoryId: "$equipment.categoryId",
                categoryName: "$category.name",
                amount: "$salePrice"
              }
            }
          }
        }
      ]).toArray(),

      db.collection("categories").find({ isActive: true }).toArray(),

      db.collection("bookings").aggregate([
        {
          $match: {
            status: "completed",
            createdAt: { $gte: dateRange.start, $lte: dateRange.end }
          }
        },
        {
          $unwind: "$bookingItems"
        },
        {
          $group: {
            _id: "$bookingItems.equipmentId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "equipment",
            localField: "_id",
            foreignField: "_id",
            as: "equipment"
          }
        },
        {
          $unwind: { path: "$equipment", preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            equipmentId: "$_id",
            equipmentName: "$equipment.name",
            count: 1
          }
        },
        { $sort: { count: -1 } }
      ]).toArray(),

      db.collection("sales").aggregate([
        {
          $match: {
            status: "paid",
            createdAt: { $gte: dateRange.start, $lte: dateRange.end }
          }
        },
        {
          $group: {
            _id: "$equipmentId",
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: "equipment",
            localField: "_id",
            foreignField: "_id",
            as: "equipment"
          }
        },
        {
          $unwind: { path: "$equipment", preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            equipmentId: "$_id",
            equipmentName: "$equipment.name",
            count: 1
          }
        },
        { $sort: { count: -1 } }
      ]).toArray()
    ])

    const bookingData = bookings[0] || { totalBookingValue: 0, totalBookings: 0, categoryBreakdown: [] }
    const saleData = sales[0] || { totalSaleValue: 0, totalSales: 0, categoryBreakdown: [] }

    const bookingCommission = bookingData.totalBookingValue * 0.10
    const saleCommission = saleData.totalSaleValue * 0.05
    const totalCommission = bookingCommission + saleCommission
    const totalTransactions = bookingData.totalBookings + saleData.totalSales

    const categoryCommissions = calculateCategoryCommissions(
      bookingData.categoryBreakdown,
      saleData.categoryBreakdown,
      categories
    )

    return NextResponse.json({
      overview: {
        totalCommission,
        bookingCommission,
        saleCommission,
        totalTransactions,
        totalBookings: bookingData.totalBookings,
        totalSales: saleData.totalSales
      },
      categoryBreakdown: categoryCommissions,
      topBookedEquipment: topBookedEquipment.filter(e => e.equipmentName),
      topSoldEquipment: topSoldEquipment.filter(e => e.equipmentName)
    })
  } catch (error) {
    console.error("Commission analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch commission analytics" },
      { status: 500 }
    )
  }
}

function getDateRange(filter: string): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  let start: Date

  switch (filter) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      break
    case "last7days":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      break
    case "last30days":
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      break
    case "thisMonth":
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
      break
    case "lastMonth":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
      end.setMonth(end.getMonth() - 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      break
    case "last3months":
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      break
    case "last6months":
      start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
      break
    case "thisYear":
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
      break
    case "allTime":
      start = new Date(0)
      break
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      start.setHours(0, 0, 0, 0)
  }

  return { start, end }
}

function calculateCategoryCommissions(
  bookingBreakdown: any[],
  saleBreakdown: any[],
  categories: any[]
): any[] {
  const categoryMap = new Map()

  categories.forEach(cat => {
    categoryMap.set(cat._id.toString(), {
      categoryId: cat._id.toString(),
      categoryName: cat.name,
      bookingAmount: 0,
      saleAmount: 0,
      totalCommission: 0
    })
  })

  bookingBreakdown.forEach(item => {
    if (item.categoryId) {
      const key = item.categoryId.toString()
      if (categoryMap.has(key)) {
        const cat = categoryMap.get(key)
        cat.bookingAmount += item.amount
        cat.totalCommission += item.amount * 0.10
      }
    }
  })

  saleBreakdown.forEach(item => {
    if (item.categoryId) {
      const key = item.categoryId.toString()
      if (categoryMap.has(key)) {
        const cat = categoryMap.get(key)
        cat.saleAmount += item.amount
        cat.totalCommission += item.amount * 0.05
      }
    }
  })

  return Array.from(categoryMap.values())
    .filter(cat => cat.totalCommission > 0)
    .sort((a, b) => b.totalCommission - a.totalCommission)
}

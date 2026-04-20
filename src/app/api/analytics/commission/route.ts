import { NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { getDateRange, calculateCommission, calculateCategoryCommissions } from "@/src/lib/utils/commission-utils"
import { buildBookingSalesAggregation, buildTopEquipmentAggregation } from "@/src/lib/aggregations/commission-aggregations"
import { BOOKING_COMMISSION_RATE, SALE_COMMISSION_RATE, DATE_FILTER_OPTIONS, DateFilterOption } from "@/src/lib/constants/commission"

const QUERY_TIMEOUT = 30000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Database query timeout')), ms)
    )
  ])
}

export async function GET(request: Request) {
  try {
    const db = await connectDB()
    const { searchParams } = new URL(request.url)
    const dateFilterParam = searchParams.get("dateFilter") || "last30days"

    if (!DATE_FILTER_OPTIONS.includes(dateFilterParam as DateFilterOption)) {
      return NextResponse.json(
        { error: "Invalid date filter" },
        { status: 400 }
      )
    }

    const dateFilter = dateFilterParam as DateFilterOption
    const dateRange = getDateRange(dateFilter)

    const bookingsCollection = db.collection("bookings")
    const salesCollection = db.collection("sales")
    const categoriesCollection = db.collection("categories")

    const [bookings, sales, categories, topBookedEquipment, topSoldEquipment] = await withTimeout(
      Promise.all([
        bookingsCollection.aggregate(buildBookingSalesAggregation(dateRange, 'booking')).toArray(),
        salesCollection.aggregate(buildBookingSalesAggregation(dateRange, 'sale')).toArray(),
        categoriesCollection.find({ isActive: true }, { projection: { _id: 1, name: 1 } }).toArray(),
        bookingsCollection.aggregate(buildTopEquipmentAggregation(dateRange, 'booking')).toArray(),
        salesCollection.aggregate(buildTopEquipmentAggregation(dateRange, 'sale')).toArray()
      ]),
      QUERY_TIMEOUT
    )

    const bookingData = bookings[0] || { totalValue: 0, totalCount: 0, categoryBreakdown: [] }
    const saleData = sales[0] || { totalValue: 0, totalCount: 0, categoryBreakdown: [] }

    const bookingCommission = calculateCommission(bookingData.totalValue, BOOKING_COMMISSION_RATE)
    const saleCommission = calculateCommission(saleData.totalValue, SALE_COMMISSION_RATE)
    const totalCommission = bookingCommission + saleCommission
    const totalTransactions = bookingData.totalCount + saleData.totalCount

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
        totalBookings: bookingData.totalCount,
        totalSales: saleData.totalCount
      },
      categoryBreakdown: categoryCommissions,
      topBookedEquipment: topBookedEquipment.filter(e => e.equipmentName),
      topSoldEquipment: topSoldEquipment.filter(e => e.equipmentName)
    })
  } catch (error) {
    console.error("Commission analytics API error:", error)
    
    const isTimeout = error instanceof Error && error.message === 'Database query timeout'
    
    return NextResponse.json(
      { error: isTimeout ? "Request timeout - please try again" : "Failed to fetch commission analytics" },
      { status: isTimeout ? 504 : 500 }
    )
  }
}

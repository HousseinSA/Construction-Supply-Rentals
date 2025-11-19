import { NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"

export async function GET(request: Request) {
  try {
    const db = await connectDB()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      totalEquipment,
      newUsersThisMonth,
      activeEquipment,
      usersByRole,
      equipmentByCity,
      topSuppliers
    ] = await Promise.all([
      // Basic counts - exclude admins
      db.collection('users').countDocuments({ userType: { $ne: 'admin' } }),
      db.collection('equipment').countDocuments(),
      
      // User growth - exclude admins
      db.collection('users').countDocuments({ createdAt: { $gte: thirtyDaysAgo }, userType: { $ne: 'admin' } }),
      
      // Equipment status - using isAvailable field
      db.collection('equipment').countDocuments({ isAvailable: true }),
      
      // User type distribution
      db.collection('users').aggregate([
        { $match: { userType: { $in: ['supplier', 'renter'] } } },
        { $group: { _id: '$userType', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Equipment by city
      db.collection('equipment').aggregate([
        { $match: { location: { $exists: true, $ne: null, $ne: '' } } },
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray(),
      
      // Top 3 suppliers by equipment count
      db.collection('users').aggregate([
        { $match: { userType: 'supplier' } },
        {
          $lookup: {
            from: 'equipment',
            localField: '_id',
            foreignField: 'supplierId',
            as: 'equipment'
          }
        },
        {
          $addFields: {
            equipmentCount: { $size: '$equipment' }
          }
        },
        { $match: { equipmentCount: { $gt: 0 } } },
        { $sort: { equipmentCount: -1 } },
        { $limit: 3 },
        {
          $project: {
            name: { $concat: ['$firstName', ' ', '$lastName'] },
            companyName: '$companyName',
            email: '$email',
            equipmentCount: 1
          }
        }
      ]).toArray()
    ])

    return NextResponse.json({
      // Overview metrics
      overview: {
        totalUsers,
        totalEquipment,
        activeEquipment,
        newUsersThisMonth
      },
      
      // Distribution data
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {}),
      
      equipmentByCity: equipmentByCity.map(item => ({
        city: item._id,
        count: item.count
      })),
      
      topSuppliers
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
import { ObjectId } from "mongodb"

export interface BookingQueryParams {
  userId?: string
  isAdmin: boolean
  status?: string | null
  date?: string | null
  search?: string
  page: number
  limit: number
}

function buildMatchStage(params: BookingQueryParams) {
  const matchStage: any = {}

  if (!params.isAdmin && params.userId) {
    matchStage.renterId = new ObjectId(params.userId)
  }

  if (params.status && params.status !== "all") {
    matchStage.status = params.status
  }

  if (params.date && params.date !== "all") {
    const now = new Date()
    let startDate: Date | undefined
    if (params.date === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0))
    } else if (params.date === "week") {
      startDate = new Date(now.setDate(now.getDate() - 7))
    } else if (params.date === "month") {
      startDate = new Date(now.setDate(now.getDate() - 30))
    }
    if (startDate) {
      matchStage.createdAt = { $gte: startDate }
    }
  }

  return Object.keys(matchStage).length > 0 ? { $match: matchStage } : null
}

function buildRenterLookup() {
  return {
    $lookup: {
      from: "users",
      localField: "renterId",
      foreignField: "_id",
      as: "renterInfo",
    },
  }
}

function buildSupplierLookupStages() {
  return [
    {
      $addFields: {
        supplierIds: {
          $map: {
            input: "$bookingItems",
            as: "item",
            in: "$$item.supplierId",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "supplierIds",
        foreignField: "_id",
        as: "supplierInfo",
      },
    },
    {
      $addFields: {
        hasAdminCreatedEquipment: {
          $anyElementTrue: {
            $map: {
              input: "$supplierInfo",
              as: "supplier",
              in: { $eq: ["$$supplier.role", "admin"] },
            },
          },
        },
      },
    },
  ]
}

function buildEquipmentLookupStages() {
  return [
    {
      $addFields: {
        equipmentIds: {
          $map: {
            input: "$bookingItems",
            as: "item",
            in: "$$item.equipmentId",
          },
        },
      },
    },
    {
      $lookup: {
        from: "equipment",
        localField: "equipmentIds",
        foreignField: "_id",
        as: "equipmentDetails",
      },
    },
    {
      $addFields: {
        bookingItems: {
          $map: {
            input: "$bookingItems",
            as: "item",
            in: {
              $mergeObjects: [
                "$$item",
                {
                  equipmentImage: {
                    $let: {
                      vars: {
                        equipment: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$equipmentDetails",
                                as: "eq",
                                cond: {
                                  $eq: ["$$eq._id", "$$item.equipmentId"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: { $arrayElemAt: ["$$equipment.images", 0] },
                    },
                  },
                  equipmentCreatedBy: {
                    $let: {
                      vars: {
                        equipment: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$equipmentDetails",
                                as: "eq",
                                cond: {
                                  $eq: ["$$eq._id", "$$item.equipmentId"],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: "$$equipment.createdBy",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    { $project: { equipmentDetails: 0, equipmentIds: 0 } },
  ]
}

function buildSearchStage(search: string) {
  if (!search || !search.trim()) return null

  return {
    $match: {
      $or: [
        { referenceNumber: { $regex: search, $options: "i" } },
        { "renterInfo.firstName": { $regex: search, $options: "i" } },
        { "renterInfo.lastName": { $regex: search, $options: "i" } },
        { "supplierInfo.firstName": { $regex: search, $options: "i" } },
        { "supplierInfo.lastName": { $regex: search, $options: "i" } },
        { "bookingItems.equipmentName": { $regex: search, $options: "i" } },
      ],
    },
  }
}

function buildPaginationStage(page: number, limit: number) {
  const skip = (page - 1) * limit
  return [
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
  ]
}

export function buildBookingAggregationPipeline(params: BookingQueryParams) {
  const pipeline: any[] = []

  const matchStage = buildMatchStage(params)
  if (matchStage) pipeline.push(matchStage)

  pipeline.push(buildRenterLookup())

  if (params.isAdmin) {
    pipeline.push(...buildSupplierLookupStages())
  }

  pipeline.push(...buildEquipmentLookupStages())

  const searchStage = buildSearchStage(params.search || "")
  if (searchStage) pipeline.push(searchStage)

  pipeline.push(...buildPaginationStage(params.page, params.limit))

  return pipeline
}

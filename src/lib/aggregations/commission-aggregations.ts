import { TOP_EQUIPMENT_LIMIT } from "../constants/commission"
import { Document } from "mongodb"

export function buildBookingSalesAggregation(
  dateRange: { start: Date; end: Date },
  type: "booking" | "sale",
): Document[] {
  const isBooking = type === "booking"
  const statusField = isBooking ? "completed" : "paid"

  const pipeline: Document[] = [
    {
      $match: {
        status: statusField,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
  ]

  if (isBooking) {
    pipeline.push({ $unwind: "$bookingItems" })
  }

  pipeline.push(
    {
      $lookup: {
        from: "equipment",
        localField: isBooking ? "bookingItems.equipmentId" : "equipmentId",
        foreignField: "_id",
        as: "equipment",
      },
    },
    {
      $unwind: { path: "$equipment", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "categories",
        localField: "equipment.categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
    },
    {
      $group: {
        _id: null,
        totalValue: {
          $sum: isBooking ? "$bookingItems.subtotal" : "$salePrice",
        },
        totalCount: { $sum: 1 },
        categoryBreakdown: {
          $push: {
            categoryId: "$equipment.categoryId",
            categoryName: "$category.name",
            amount: isBooking ? "$bookingItems.subtotal" : "$salePrice",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalValue: 1,
        totalCount: 1,
        categoryBreakdown: 1,
      },
    },
  )

  return pipeline
}

export function buildTopEquipmentAggregation(
  dateRange: { start: Date; end: Date },
  type: "booking" | "sale",
): Document[] {
  const isBooking = type === "booking"
  const statusField = isBooking ? "completed" : "paid"

  const pipeline: Document[] = [
    {
      $match: {
        status: statusField,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
  ]

  if (isBooking) {
    pipeline.push({ $unwind: "$bookingItems" })
  }

  pipeline.push(
    {
      $group: {
        _id: isBooking ? "$bookingItems.equipmentId" : "$equipmentId",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: TOP_EQUIPMENT_LIMIT },
    {
      $lookup: {
        from: "equipment",
        localField: "_id",
        foreignField: "_id",
        as: "equipment",
      },
    },
    {
      $unwind: { path: "$equipment", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 0,
        equipmentId: "$_id",
        equipmentName: "$equipment.name",
        count: 1,
      },
    },
  )

  return pipeline
}

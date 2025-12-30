import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const equipmentId = searchParams.get("id")
    const limit = parseInt(searchParams.get("limit") || "6")
    const type = searchParams.get("type") || "booking"

    if (!equipmentId || !ObjectId.isValid(equipmentId)) {
      return NextResponse.json({ success: false, error: "Invalid equipment ID" })
    }

    const db = await connectDB()
    const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(equipmentId) })
    
    if (!equipment) {
      return NextResponse.json({ success: false, error: "Equipment not found" })
    }

    const unavailableBookings = await db.collection("bookings").find({ status: { $in: ["pending", "paid"] } }).toArray()
    const pendingSales = await db.collection("sales").find({ status: "pending" }).toArray()
    const manuallyUnavailableEquipment = await db.collection("equipment").find({ isAvailable: false }).toArray()

    const unavailableEquipmentIds = [
      ...unavailableBookings.flatMap((b: any) => b.bookingItems.map((item: any) => item.equipmentId)),
      ...pendingSales.map((s: any) => s.equipmentId),
      ...manuallyUnavailableEquipment.map(e => e._id)
    ].map(id => new ObjectId(id))

    if (type === "sale") {
      // For sale success: prioritize forSale
      const sameCategorySale = await db.collection("equipment").find({
        _id: { $ne: new ObjectId(equipmentId), $nin: unavailableEquipmentIds },
        categoryId: equipment.categoryId,
        status: "approved",
        isAvailable: true,
        listingType: "forSale"
      }).limit(limit).toArray()

      let result = sameCategorySale

      if (result.length < limit) {
        const othersSale = await db.collection("equipment").find({
          _id: { $ne: new ObjectId(equipmentId), $nin: unavailableEquipmentIds },
          categoryId: { $ne: equipment.categoryId },
          status: "approved",
          isAvailable: true,
          listingType: "forSale"
        }).limit(limit - result.length).toArray()

        result = [...result, ...othersSale]
      }

      return NextResponse.json({ success: true, equipment: result })
    } else {
      // For booking success: prioritize forRent, then fill with forSale if needed
      const sameCategoryRent = await db.collection("equipment").find({
        _id: { $ne: new ObjectId(equipmentId), $nin: unavailableEquipmentIds },
        categoryId: equipment.categoryId,
        status: "approved",
        isAvailable: true,
        listingType: "forRent"
      }).limit(limit).toArray()

      let result = sameCategoryRent

      if (result.length < limit) {
        // Fill with forRent other categories
        const othersRent = await db.collection("equipment").find({
          _id: { $ne: new ObjectId(equipmentId), $nin: unavailableEquipmentIds },
          categoryId: { $ne: equipment.categoryId },
          status: "approved",
          isAvailable: true,
          listingType: "forRent"
        }).limit(limit - result.length).toArray()

        result = [...result, ...othersRent]
      }

      if (result.length < limit) {
        // Fill with forSale same category
        const sameCategorySale = await db.collection("equipment").find({
          _id: { $ne: new ObjectId(equipmentId), $nin: unavailableEquipmentIds },
          categoryId: equipment.categoryId,
          status: "approved",
          isAvailable: true,
          listingType: "forSale"
        }).limit(limit - result.length).toArray()

        result = [...result, ...sameCategorySale]
      }

      if (result.length < limit) {
        // Finally, fill with forSale other categories
        const othersSale = await db.collection("equipment").find({
          _id: { $ne: new ObjectId(equipmentId), $nin: unavailableEquipmentIds },
          categoryId: { $ne: equipment.categoryId },
          status: "approved",
          isAvailable: true,
          listingType: "forSale"
        }).limit(limit - result.length).toArray()

        result = [...result, ...othersSale]
      }

      return NextResponse.json({ success: true, equipment: result })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch equipment" })
  }
}

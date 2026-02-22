import type { Db } from "mongodb"
import { ObjectId } from "mongodb"

export async function sendNewEquipmentNotification(
  db: Db,
  equipmentData: {
    equipmentName: string
    userId: string
    categoryId: string
    location: string
    pricing: any
    listingType: string
  },
) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  try {
    const [supplier, category] = await Promise.all([
      db
        .collection("users")
        .findOne({ _id: new ObjectId(equipmentData.userId) }),
      db
        .collection("categories")
        .findOne({ _id: new ObjectId(equipmentData.categoryId) }),
    ])

    let pricingText = ""
    if (
      equipmentData.listingType === "forSale" &&
      equipmentData.pricing.salePrice
    ) {
      pricingText = `${equipmentData.pricing.salePrice.toFixed(2)} MRU`
    } else {
      const prices = []
      if (equipmentData.pricing.hourlyRate)
        prices.push(`${equipmentData.pricing.hourlyRate} MRU / heure`)
      if (equipmentData.pricing.dailyRate)
        prices.push(`${equipmentData.pricing.dailyRate} MRU / jour`)
      if (equipmentData.pricing.kmRate)
        prices.push(`${equipmentData.pricing.kmRate} MRU / km`)
      if (equipmentData.pricing.tonRate)
        prices.push(`${equipmentData.pricing.tonRate} MRU / tonne`)
      pricingText = prices.join(", ")
    }

    const { sendNewEquipmentEmail } = await import("@/src/lib/email")
    await sendNewEquipmentEmail(adminEmail, {
      equipmentName: equipmentData.equipmentName,
      supplierName: supplier
        ? `${supplier.firstName} ${supplier.lastName}`
        : "Unknown",
      supplierPhone: supplier?.phone || "N/A",
      location: equipmentData.location,
      category: category?.name || "N/A",
      listingType:
        equipmentData.listingType === "forSale" ? "Vente" : "Location",
      pricing: pricingText,
      dateSubmitted: new Date(),
    })
  } catch (error) {
    console.error("Email error:", error)
  }
}

export async function sendEquipmentApprovalNotification(
  db: Db,
  equipment: any,
) {
  try {
    const supplier = await db
      .collection("users")
      .findOne({ _id: equipment.supplierId })
    if (supplier?.email) {
      const { sendEquipmentApprovalEmail } = await import("@/src/lib/email")
      await sendEquipmentApprovalEmail(supplier.email, {
        equipmentName: equipment.name,
        supplierName: supplier.firstName,
      })
    }
  } catch (error) {
    console.error("Email error:", error)
  }
}

export async function sendPricingUpdateNotification(
  db: Db,
  equipment: any,
  newPricing: any,
) {
  try {
    const [supplier, adminUser] = await Promise.all([
      db.collection("users").findOne({ _id: equipment.supplierId }),
      db.collection("users").findOne({ role: "admin" }),
    ])

    if (adminUser?.email && supplier) {
      const formatPricing = (pricing: any) => {
        const parts = []
        if (pricing.hourlyRate) parts.push(`${pricing.hourlyRate} MRU/h`)
        if (pricing.dailyRate) parts.push(`${pricing.dailyRate} MRU/jour`)
        if (pricing.kmRate) parts.push(`${pricing.kmRate} MRU/km`)
        if (pricing.tonRate) parts.push(`${pricing.tonRate} MRU/tonne`)
        if (pricing.salePrice) parts.push(`${pricing.salePrice} MRU`)
        return parts.join(", ") || "-"
      }

      const { sendPricingUpdateRequestEmail } = await import("@/src/lib/email")
      await sendPricingUpdateRequestEmail(adminUser.email, {
        equipmentName: equipment.name,
        equipmentReference: equipment.referenceNumber || "-",
        supplierName: `${supplier.firstName} ${supplier.lastName}`,
        supplierPhone: supplier.phone,
        currentPricing: formatPricing(equipment.pricing),
        requestedPricing: formatPricing(newPricing),
        requestDate: new Date(),
      })
    }
  } catch (error) {
    console.error("Email error:", error)
  }
}

export async function sendPricingApprovalNotification(db: Db, equipment: any) {
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
  } catch (error) {
    console.error("Email error:", error)
  }
}

export async function sendPricingRejectionNotification(
  db: Db,
  equipment: any,
  rejectionReason: string,
) {
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
  } catch (error) {
    console.error("Email error:", error)
  }
}

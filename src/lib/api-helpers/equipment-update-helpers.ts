import { ObjectId } from "mongodb"
import type { Db } from "mongodb"
import type { Equipment } from "@/src/lib/models/equipment"
import { sendPricingUpdateNotification } from "./email-service"

type PricingKey = 'hourlyRate' | 'dailyRate' | 'monthlyRate' | 'kmRate' | 'tonRate' | 'salePrice'

export function clearRejectedPricingFields(
  pendingPricing: Equipment['pendingPricing'],
  newPricing: Record<string, number>
): Equipment['pendingPricing'] {
  if (!pendingPricing) return null

  const remainingPending: Partial<Record<PricingKey, number>> = {}
  const keys = Object.keys(pendingPricing) as PricingKey[]
  
  keys.forEach((key) => {
    if (!newPricing.hasOwnProperty(key) && pendingPricing[key] !== undefined) {
      remainingPending[key] = pendingPricing[key]
    }
  })

  return Object.keys(remainingPending).length > 0 ? (remainingPending as Equipment['pendingPricing']) : null
}

export function handleAdminPricingUpdate(
  equipment: Equipment,
  newPricing: Record<string, number>
): Partial<Equipment> {
  return {
    pricing: { ...equipment.pricing, ...newPricing },
    pendingPricing: clearRejectedPricingFields(equipment.pendingPricing, newPricing)
  }
}

function clearUnfixedRejections(
  equipment: Equipment,
  changedPricing: Record<string, number>
): { reasons: Record<string, string> | null; values: Partial<Record<PricingKey, number>> | null } {
  const remainingRejections: Record<string, string> = {}
  const remainingValues: Partial<Record<PricingKey, number>> = {}

  if (equipment.pricingRejectionReasons?._all) {
    let hasUnfixedRejections = false
    const rejectedKeys = Object.keys(equipment.rejectedPricingValues || {}) as PricingKey[]
    
    rejectedKeys.forEach((key) => {
      if (!changedPricing.hasOwnProperty(key) && equipment.rejectedPricingValues![key] !== undefined) {
        hasUnfixedRejections = true
        remainingValues[key] = equipment.rejectedPricingValues![key]
      }
    })

    if (hasUnfixedRejections) {
      remainingRejections._all = equipment.pricingRejectionReasons._all
    }
  }

  if (equipment.pricingRejectionReasons) {
    const rejectionKeys = Object.keys(equipment.pricingRejectionReasons)
    
    rejectionKeys.forEach((key) => {
      if (key === "_all") return

      if (!changedPricing.hasOwnProperty(key)) {
        remainingRejections[key] = equipment.pricingRejectionReasons![key]
        const pricingKey = key as PricingKey
        if (equipment.rejectedPricingValues?.[pricingKey] !== undefined) {
          remainingValues[pricingKey] = equipment.rejectedPricingValues[pricingKey]
        }
      }
    })
  } else if (equipment.rejectedPricingValues) {
    const valueKeys = Object.keys(equipment.rejectedPricingValues) as PricingKey[]
    
    valueKeys.forEach((key) => {
      if (!changedPricing.hasOwnProperty(key) && equipment.rejectedPricingValues![key] !== undefined) {
        remainingValues[key] = equipment.rejectedPricingValues![key]
      }
    })
  }

  return {
    reasons: Object.keys(remainingRejections).length > 0 ? remainingRejections : null,
    values: Object.keys(remainingValues).length > 0 ? remainingValues : null
  }
}

async function handleApprovedEquipmentPricingUpdate(
  db: Db,
  equipment: Equipment,
  changedPricing: Record<string, number>
): Promise<Partial<Equipment>> {
  const updateData: Partial<Equipment> = {
    pendingPricing: equipment.pendingPricing
      ? { ...equipment.pendingPricing, ...changedPricing }
      : changedPricing
  }

  const { reasons, values } = clearUnfixedRejections(equipment, changedPricing)
  updateData.pricingRejectionReasons = reasons
  updateData.rejectedPricingValues = values

  await sendPricingUpdateNotification(db, equipment, changedPricing)

  return updateData
}

export async function handleSupplierPricingUpdate(
  db: Db,
  equipment: Equipment,
  newPricing: Record<string, number>,
  detectPricingChanges: (current: Equipment['pricing'], newPricing: Record<string, number>) => { changedPricing: Record<string, number>; hasChanges: boolean }
): Promise<Partial<Equipment>> {
  const { changedPricing, hasChanges } = detectPricingChanges(equipment.pricing, newPricing)

  if (!hasChanges) return {}

  if (equipment.status === "approved") {
    return handleApprovedEquipmentPricingUpdate(db, equipment, changedPricing)
  }

  return {
    pricing: { ...equipment.pricing, ...changedPricing },
    pendingPricing: null,
    pricingRejectionReasons: null,
    rejectedPricingValues: null
  }
}

export function buildCommonUpdateData(
  body: Record<string, unknown>
): Partial<Equipment> {
  const updateData: Partial<Equipment> = {}

  if (body.description !== undefined) updateData.description = body.description as string
  if (body.images !== undefined) updateData.images = body.images as string[]
  if (body.specifications !== undefined) updateData.specifications = body.specifications as Equipment['specifications']

  return updateData
}

export async function handleStatusUpdate(
  db: Db,
  equipment: Equipment,
  newStatus: string,
  userId: string,
  rejectionReason?: string
): Promise<Partial<Equipment>> {
  const updateData: Partial<Equipment> = { status: newStatus }

  if (newStatus === "approved") {
    updateData.approvedAt = new Date()
    updateData.approvedBy = new ObjectId(userId)
    updateData.rejectionReason = null
    updateData.rejectedAt = null

    const { sendEquipmentApprovalNotification } = await import("./email-service")
    await sendEquipmentApprovalNotification(db, equipment)
  } else if (newStatus === "rejected") {
    updateData.rejectionReason = rejectionReason?.trim() || null
    updateData.rejectedAt = new Date()
  }

  return updateData
}

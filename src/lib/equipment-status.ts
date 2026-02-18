import { Equipment } from "./models/equipment"

export type UnifiedStatus = 
  | "REJECTED" 
  | "PRICING_REJECTED" 
  | "PENDING_REVIEW" 
  | "PRICING_PENDING" 
  | "SOLD" 
  | "ACTIVE"

export function getUnifiedStatus(item: any): UnifiedStatus {
  if (item.status === "rejected") return "REJECTED"
  if (item.pricingRejectionReasons && Object.keys(item.pricingRejectionReasons).length > 0) return "PRICING_REJECTED"
  if (item.status === "pending") return "PENDING_REVIEW"
  if (item.pendingPricing) return "PRICING_PENDING"
  if (item.listingType === "forSale" && !item.isAvailable) return "SOLD"
  return "ACTIVE"
}

export function getStatusConfig(status: UnifiedStatus, t: (key: string) => string) {
  const configs = {
    REJECTED: {
      label: t("status.rejected"),
      color: "bg-red-100 text-red-700 border-red-200",
      icon: "❌",
    },
    PRICING_REJECTED: {
      label: t("status.pricingRejected"),
      color: "bg-orange-100 text-orange-700 border-orange-200",
      icon: "⚠️",
    },
    PENDING_REVIEW: {
      label: t("status.pendingReview"),
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: "⏳",
    },
    PRICING_PENDING: {
      label: t("status.pricingPending"),
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: "🔄",
    },
    SOLD: {
      label: t("status.sold"),
      color: "bg-gray-100 text-gray-700 border-gray-200",
      icon: "✓",
    },
    ACTIVE: {
      label: t("status.active"),
      color: "bg-green-100 text-green-700 border-green-200",
      icon: "✓",
    },
  }
  return configs[status]
}

export function getStatusDetails(item: any, status: UnifiedStatus) {
  if (status === "REJECTED") {
    return { reason: item.rejectionReason, date: item.rejectedAt }
  }
  if (status === "PRICING_REJECTED") {
    const reasons = item.pricingRejectionReasons
    const reasonText = reasons?._all || Object.values(reasons || {}).filter(r => r !== reasons?._all).join(", ")
    return { reason: reasonText, date: item.updatedAt }
  }
  if (status === "PRICING_PENDING") {
    return { reason: null, date: item.pendingPricing?.requestedAt }
  }
  return { reason: null, date: null }
}

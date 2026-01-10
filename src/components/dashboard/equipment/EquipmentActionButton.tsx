"use client"

import { UnifiedStatus } from "@/src/lib/equipment-status"
import { Edit, RefreshCw } from "lucide-react"

interface EquipmentActionButtonProps {
  status: UnifiedStatus
  isSupplier: boolean
  isAdmin: boolean
  equipmentId: string
  updating: boolean
  onApprove?: () => void
  onReject?: () => void
  onResubmit?: () => void
  onEditPricing?: () => void
  onReviewPricing?: () => void
  t: (key: string) => string
}

export default function EquipmentActionButton({
  status,
  isSupplier,
  isAdmin,
  equipmentId,
  updating,
  onApprove,
  onReject,
  onResubmit,
  onEditPricing,
  onReviewPricing,
  t,
}: EquipmentActionButtonProps) {
  
  // Rejected equipment - Supplier can resubmit
  if (status === "REJECTED" && isSupplier) {
    return (
      <button
        onClick={onResubmit}
        disabled={updating}
        className="w-full px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="w-4 h-4" />
        {updating ? t("resubmitting") : t("resubmit")}
      </button>
    )
  }

  // Pricing rejected - Supplier can update pricing
  if (status === "PRICING_REJECTED" && isSupplier) {
    return (
      <button
        onClick={onEditPricing}
        disabled={updating}
        className="w-full px-3 py-2 text-sm font-medium bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <Edit className="w-4 h-4" />
        {t("updatePricing")}
      </button>
    )
  }

  // Pricing pending - Admin can review
  if (status === "PRICING_PENDING" && isAdmin) {
    return (
      <button
        onClick={onReviewPricing}
        className="w-full px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="w-4 h-4" />
        {t("reviewPricing")}
      </button>
    )
  }

  // Pending review - Admin can approve/reject
  if (status === "PENDING_REVIEW" && isAdmin) {
    return (
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={updating}
          className="flex-1 px-3 py-2 text-sm font-medium bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {t("approve")}
        </button>
        <button
          onClick={onReject}
          disabled={updating}
          className="flex-1 px-3 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
        >
          {t("reject")}
        </button>
      </div>
    )
  }

  return null
}

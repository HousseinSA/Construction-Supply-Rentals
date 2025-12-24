"use client"

import { useState } from "react"
import { Clock, Check, X } from "lucide-react"
import { showToast } from "@/src/lib/toast"
import Button from "../ui/Button"
import RejectionModal from "../dashboard/equipment/RejectionModal"

interface AdminPricingActionsProps {
  equipmentId: string
  currentPricing: any
  pendingPricing: any
  listingType: "forSale" | "forRent"
  onUpdate: () => void
}

export default function AdminPricingActions({
  equipmentId,
  currentPricing,
  pendingPricing,
  listingType,
  onUpdate,
}: AdminPricingActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const formatPrice = (value: number) => `${value} MRU`

  const handleApprove = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })

      if (!response.ok) throw new Error()
      showToast.success("Pricing approved successfully")
      onUpdate()
    } catch (error) {
      showToast.error("Failed to approve pricing")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (reason: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: reason }),
      })

      if (!response.ok) throw new Error()
      showToast.success("Pricing rejected")
      setShowRejectModal(false)
      onUpdate()
    } catch (error) {
      showToast.error("Failed to reject pricing")
    } finally {
      setLoading(false)
    }
  }

  const renderPriceChanges = () => {
    if (listingType === "forSale") {
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">{formatPrice(currentPricing.salePrice)}</span>
          <span className="text-gray-400">→</span>
          <span className="font-semibold text-orange-600">{formatPrice(pendingPricing.salePrice)}</span>
        </div>
      )
    }

    const changes = []
    if (pendingPricing.hourlyRate) {
      changes.push({
        label: "Hourly",
        current: currentPricing.hourlyRate,
        pending: pendingPricing.hourlyRate,
      })
    }
    if (pendingPricing.dailyRate) {
      changes.push({
        label: "Daily",
        current: currentPricing.dailyRate,
        pending: pendingPricing.dailyRate,
      })
    }
    if (pendingPricing.kmRate) {
      changes.push({
        label: "Per KM",
        current: currentPricing.kmRate,
        pending: pendingPricing.kmRate,
      })
    }
    if (pendingPricing.tonRate) {
      changes.push({
        label: "Per Ton",
        current: currentPricing.tonRate,
        pending: pendingPricing.tonRate,
      })
    }

    return (
      <div className="space-y-1">
        {changes.map((change, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 min-w-[70px]">{change.label}:</span>
            <span className="text-gray-600">{formatPrice(change.current)}</span>
            <span className="text-gray-400">→</span>
            <span className="font-semibold text-orange-600">{formatPrice(change.pending)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-orange-700 mb-2">
              Pending Pricing Change Request
            </p>
            {renderPriceChanges()}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Approve
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Reject
          </Button>
        </div>
      </div>

      <RejectionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Pricing Change"
        message="Please provide a reason for rejecting this pricing change request."
        confirmText="Reject"
        cancelText="Cancel"
        placeholder="Enter rejection reason..."
        isLoading={loading}
      />
    </>
  )
}

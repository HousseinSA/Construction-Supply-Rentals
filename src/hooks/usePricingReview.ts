import { useState, useEffect } from "react"
import { toast } from "sonner"

interface UsePricingReviewProps {
  equipmentId: string
  currentPricing: any
  pendingPricing: any
  onSuccess: () => void
  onClose: () => void
  t: (key: string) => string
}

export function usePricingReview({
  equipmentId,
  currentPricing,
  pendingPricing,
  onSuccess,
  onClose,
  t,
}: UsePricingReviewProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [selectedRates, setSelectedRates] = useState<string[]>([])
  const [selectAllClicked, setSelectAllClicked] = useState(false)

  const newRates = Object.entries(pendingPricing)
    .filter(([key, value]) => {
      if (!value || typeof value !== "number") return false
      return !currentPricing[key] || currentPricing[key] === 0
    })
    .map(([key]) => key)

  const changedRates = Object.entries(pendingPricing)
    .filter(([key, value]) => {
      if (!value || typeof value !== "number") return false
      return (
        currentPricing[key] &&
        currentPricing[key] !== 0 &&
        currentPricing[key] !== pendingPricing[key]
      )
    })
    .map(([key]) => key)

  const allRates = [...newRates, ...changedRates]

  useEffect(() => {
    if (allRates.length === 0) {
      onClose()
    }
  }, [allRates.length, onClose])

  const allSelected = allRates.length > 0 && selectedRates.length === allRates.length

  const toggleSelectAll = () => {
    setSelectedRates(allSelected ? [] : allRates)
    setSelectAllClicked(!allSelected)
  }

  const toggleRate = (rate: string) => {
    setSelectedRates((prev) =>
      prev.includes(rate) ? prev.filter((r) => r !== rate) : [...prev, rate]
    )
    setSelectAllClicked(false)
  }

  const handleApprove = async () => {
    if (selectedRates.length === 0) {
      toast.error(t("selectRatesToApprove"))
      return
    }
    setIsApproving(true)
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", selectedRates }),
      })
      if (!response.ok) throw new Error()
      toast.success(t("pricingApproved"))
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(t("processingRequest"))
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (selectedRates.length === 0) {
      toast.error(t("selectRatesToApprove"))
      return
    }
    setIsRejecting(true)
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          selectedRates,
          rejectionReason: rejectionReason.trim() || undefined,
          useAllKey: selectAllClicked && allRates.length > 1,
        }),
      })
      if (!response.ok) throw new Error()
      toast.success(t("pricingRejected"))
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(t("processingRequest"))
    } finally {
      setIsRejecting(false)
    }
  }

  return {
    isApproving,
    isRejecting,
    rejectionReason,
    setRejectionReason,
    showRejectInput,
    setShowRejectInput,
    selectedRates,
    newRates,
    changedRates,
    allRates,
    allSelected,
    toggleSelectAll,
    toggleRate,
    handleApprove,
    handleReject,
  }
}

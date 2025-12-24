"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useModalClose } from "@/src/hooks/useModalClose"
import ModalHeader from "@/src/components/booking/ModalHeader"

interface PricingReviewModalProps {
  equipmentId: string
  equipmentName: string
  currentPricing: any
  pendingPricing: any
  onClose: () => void
  onSuccess: () => void
}

export default function PricingReviewModal({
  equipmentId,
  equipmentName,
  currentPricing,
  pendingPricing,
  onClose,
  onSuccess,
}: PricingReviewModalProps) {
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const modalRef = useRef<HTMLDivElement>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectInput, setShowRejectInput] = useState(false)

  useModalClose(true, onClose, modalRef)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
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
    if (!rejectionReason.trim()) {
      toast.error(t("provideRejectionReason"))
      return
    }
    setIsRejecting(true)
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason }),
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

  const formatPrice = (price: number | undefined) => {
    if (!price) return "-"
    return new Intl.NumberFormat("en-US").format(price)
  }

  const getRateLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      hourlyRate: t("hourly"),
      dailyRate: t("daily"),
      kmRate: t("perKm"),
      tonRate: t("tonRate"),
      salePrice: t("salePrice")
    }
    return labelMap[key] || key
  }

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4">
        <div 
          ref={modalRef}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <ModalHeader title={t("reviewPricingRequest")} onClose={onClose} />
            <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-900">{equipmentName}</div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{t("currentPricing")}</h3>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    {Object.entries(currentPricing)
                      .filter(([key, value]) => key !== 'monthlyRate' && key !== 'requestedAt' && value && typeof value === 'number')
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-600">{getRateLabel(key)}:</span>
                          <span className="text-sm font-medium" dir="ltr">{formatPrice(value as number)} MRU</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{t("requestedPricing")}</h3>
                  <div className="space-y-2 bg-orange-50 p-4 rounded-lg border border-orange-200">
                    {Object.entries(pendingPricing)
                      .filter(([key, value]) => key !== 'monthlyRate' && key !== 'requestedAt' && value && typeof value === 'number')
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-600">{getRateLabel(key)}:</span>
                          <span className="text-sm font-medium text-orange-700" dir="ltr">{formatPrice(value as number)} MRU</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {showRejectInput && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("rejectionReason")}
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
                    placeholder={t("rejectionReasonPlaceholder")}
                  />
                </div>
              )}

              <div className="flex gap-3">
                {!showRejectInput ? (
                  <>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      disabled={isRejecting || isApproving}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 transition-colors"
                    >
                      {t("rejectPricing")}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isApproving || isRejecting}
                      className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 transition-colors"
                    >
                      {isApproving ? t("processingRequest") : t("approvePricing")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowRejectInput(false)
                        setRejectionReason("")
                      }}
                      disabled={isRejecting}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 transition-colors"
                    >
                      {tCommon("cancel")}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isRejecting}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 transition-colors"
                    >
                      {isRejecting ? t("processingRequest") : t("confirmReject")}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useModalClose } from "@/src/hooks/useModalClose"
import { usePricingReview } from "@/src/hooks/usePricingReview"
import ModalHeader from "@/src/components/booking/ModalHeader"
import CustomCheckbox from "@/src/components/ui/CustomCheckbox"
import PricingRateItem from "./PricingRateItem"
import { getRateLabel, formatPrice } from "@/src/lib/pricingUtils"

interface PricingReviewModalProps {
  equipmentId: string
  currentPricing: any
  pendingPricing: any
  onClose: () => void
  onSuccess: () => void
}

export default function PricingReviewModal({
  equipmentId,
  currentPricing,
  pendingPricing,
  onClose,
  onSuccess,
}: PricingReviewModalProps) {
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const isRTL = locale === "ar"
  const modalRef = useRef<HTMLDivElement>(null)

  const {
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
  } = usePricingReview({
    equipmentId,
    currentPricing,
    pendingPricing,
    onSuccess,
    onClose,
    t,
  })

  useModalClose(true, onClose, modalRef)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <ModalHeader title={t("reviewPricingRequest")} onClose={onClose} />
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-6 rounded-xl border border-gray-200">
                {allRates.length > 1 && (
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-300">
                    <CustomCheckbox
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      label={`${t("selectAll")} (${selectedRates.length}/${allRates.length})`}
                    />
                  </div>
                )}
                {newRates.map((key) => (
                  <PricingRateItem
                    key={key}
                    rateKey={key}
                    value={pendingPricing[key]}
                    label={getRateLabel(key, t)}
                    isSelected={selectedRates.includes(key)}
                    onToggle={() => toggleRate(key)}
                    formatPrice={formatPrice}
                    type="new"
                    isRTL={isRTL}
                    newLabel={t("new")}
                  />
                ))}
                {changedRates.map((key) => (
                  <PricingRateItem
                    key={key}
                    rateKey={key}
                    value={pendingPricing[key]}
                    oldValue={currentPricing[key]}
                    label={getRateLabel(key, t)}
                    isSelected={selectedRates.includes(key)}
                    onToggle={() => toggleRate(key)}
                    formatPrice={formatPrice}
                    type="changed"
                    isRTL={isRTL}
                  />
                ))}
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
                      disabled={
                        isRejecting || isApproving || selectedRates.length === 0
                      }
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 transition-colors"
                    >
                      {t("rejectPricing")}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={
                        isApproving || isRejecting || selectedRates.length === 0
                      }
                      className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 transition-colors"
                    >
                      {isApproving
                        ? t("processingRequest")
                        : t("approvePricing")}
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
                      {isRejecting
                        ? t("processingRequest")
                        : t("confirmReject")}
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

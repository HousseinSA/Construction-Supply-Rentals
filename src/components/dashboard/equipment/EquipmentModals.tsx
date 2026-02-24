"use client"

import { AlertTriangle, CheckCircle } from "lucide-react"
import ConfirmModal from "../../ui/ConfirmModal"
import RejectionModal from "./RejectionModal"
import PricingReviewModal from "./PricingReviewModal"

interface EquipmentModalsProps {
  confirmModal: { isOpen: boolean; equipmentId: string | null; action: "approve" | "reject" | null }
  pricingModal: any
  rejectionModal: { isOpen: boolean; equipmentId: string | null }
  updating: string | null
  onConfirmClose: () => void
  onConfirmAction: () => void
  onPricingClose: () => void
  onPricingSuccess: () => void
  onRejectionClose: () => void
  onRejectionConfirm: (reason: string) => void
  t: any
  tCommon: any
}

export default function EquipmentModals({
  confirmModal,
  pricingModal,
  rejectionModal,
  updating,
  onConfirmClose,
  onConfirmAction,
  onPricingClose,
  onPricingSuccess,
  onRejectionClose,
  onRejectionConfirm,
  t,
  tCommon,
}: EquipmentModalsProps) {
  return (
    <>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={onConfirmClose}
        onConfirm={onConfirmAction}
        title={t(confirmModal.action === "approve" ? "confirmApproveTitle" : "confirmRejectTitle")}
        message={t("confirmApproveMessage")}
        confirmText={t(confirmModal.action === "approve" ? "approve" : "reject")}
        cancelText={tCommon("cancel")}
        icon={
          confirmModal.action === "approve" ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-600" />
          )
        }
        iconBgColor={confirmModal.action === "approve" ? "bg-gray-100" : "bg-red-100"}
        isLoading={updating === confirmModal.equipmentId}
      />

      {pricingModal && (
        <PricingReviewModal
          equipmentId={pricingModal._id?.toString()}
          currentPricing={pricingModal.pricing}
          pendingPricing={pricingModal.pendingPricing}
          onClose={onPricingClose}
          onSuccess={onPricingSuccess}
        />
      )}

      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={onRejectionClose}
        onConfirm={onRejectionConfirm}
        title={t("confirmRejectTitle")}
        confirmText={t("reject")}
        cancelText={tCommon("cancel")}
        placeholder={t("rejectionReason")}
        isLoading={updating === rejectionModal.equipmentId}
      />
    </>
  )
}

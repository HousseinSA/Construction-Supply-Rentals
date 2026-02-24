import { useState, useMemo } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { showToast } from "@/src/lib/toast"
import { EquipmentStatus } from "@/src/lib/types"

export function useEquipmentActions(
  handleStatusChange: (id: string, status: EquipmentStatus, reason?: string) => Promise<boolean>,
  handleAvailabilityChange: (id: string, isAvailable: boolean) => Promise<boolean>,
  t: any
) {
  const router = useRouter()
  const [navigating, setNavigating] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    equipmentId: string | null
    action: "approve" | "reject" | null
  }>({ isOpen: false, equipmentId: null, action: null })

  const [modals, setModals] = useState({
    pricing: null as any,
    rejection: { isOpen: false, equipmentId: null as string | null },
  })

  const openConfirmModal = (id: string, action: "approve" | "reject") => {
    setConfirmModal({ isOpen: true, equipmentId: id, action })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, equipmentId: null, action: null })
  }

  const handleConfirmAction = async () => {
    if (confirmModal.equipmentId && confirmModal.action) {
      const status = confirmModal.action === "approve" ? "approved" : "rejected"
      const success = await handleStatusChange(confirmModal.equipmentId, status)

      if (success) {
        showToast.success(
          t(
            confirmModal.action === "approve"
              ? "equipmentApproved"
              : "equipmentRejected"
          )
        )
      } else {
        showToast.error(t("equipmentUpdateFailed"))
      }
      closeConfirmModal()
    }
  }

  const handleAvailabilityChangeWithToast = async (
    id: string,
    isAvailable: boolean
  ) => {
    const success = await handleAvailabilityChange(id, isAvailable)
    if (success) {
      showToast.success(t("availabilityUpdated"))
    } else {
      showToast.error(t("equipmentUpdateFailed"))
    }
  }

  const handleNavigation = (url: string, equipmentId: string) => {
    setNavigating(equipmentId)
    router.push(url)
  }

  const handleReject = async (reason: string) => {
    if (!modals.rejection.equipmentId) return
    const success = await handleStatusChange(modals.rejection.equipmentId, "rejected", reason)
    if (success) setModals((p) => ({ ...p, rejection: { isOpen: false, equipmentId: null } }))
  }

  const handleStatusChangeCallback = useMemo(
    () => (id: string, action: "approve" | "reject") =>
      action === "reject"
        ? setModals((p) => ({ ...p, rejection: { isOpen: true, equipmentId: id } }))
        : openConfirmModal(id, action),
    []
  )

  const handlePricingReview = useMemo(
    () => (item: any) => setModals((p) => ({ ...p, pricing: item })),
    []
  )

  const closePricingModal = () => setModals((p) => ({ ...p, pricing: null }))
  const closeRejectionModal = () => setModals((p) => ({ ...p, rejection: { isOpen: false, equipmentId: null } }))

  return {
    navigating,
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
    handleAvailabilityChangeWithToast,
    handleNavigation,
    modals,
    handleReject,
    handleStatusChangeCallback,
    handlePricingReview,
    closePricingModal,
    closeRejectionModal,
  }
}

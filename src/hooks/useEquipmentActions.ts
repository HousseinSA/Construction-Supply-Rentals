import { showToast } from "@/src/lib/toast"
import { EquipmentStatus } from "@/src/lib/types"
import { useEquipmentModals } from "./useEquipmentModals"
import { useEquipmentNavigation } from "./useEquipmentNavigation"

export function useEquipmentActions(
  handleStatusChange: (id: string, status: EquipmentStatus, reason?: string) => Promise<boolean>,
  handleAvailabilityChange: (id: string, isAvailable: boolean) => Promise<boolean>,
  t: any
) {
  const modalHooks = useEquipmentModals()
  const navigationHooks = useEquipmentNavigation()

  const handleConfirmAction = async () => {
    if (modalHooks.confirmModal.equipmentId && modalHooks.confirmModal.action) {
      const status = modalHooks.confirmModal.action === "approve" ? "approved" : "rejected"
      const success = await handleStatusChange(modalHooks.confirmModal.equipmentId, status)

      if (success) {
        showToast.success(
          t(
            modalHooks.confirmModal.action === "approve"
              ? "equipmentApproved"
              : "equipmentRejected"
          )
        )
      } else {
        showToast.error(t("equipmentUpdateFailed"))
      }
      modalHooks.closeConfirmModal()
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

  const handleReject = async (reason: string) => {
    if (!modalHooks.modals.rejection.equipmentId) return
    const success = await handleStatusChange(modalHooks.modals.rejection.equipmentId, "rejected", reason)
    if (success) modalHooks.closeRejectionModal()
  }

  return {
    ...navigationHooks,
    ...modalHooks,
    handleConfirmAction,
    handleAvailabilityChangeWithToast,
    handleReject,
  }
}

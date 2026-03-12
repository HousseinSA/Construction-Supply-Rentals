import { useEquipmentModals } from "./useEquipmentModals"
import { useEquipmentNavigation } from "./useEquipmentNavigation"
import { useEquipmentStore } from "@/src/stores/equipmentStore"

export function useEquipmentActions(t: any) {
  const { updateEquipmentStatus } = useEquipmentStore()
  const modalHooks = useEquipmentModals()
  const navigationHooks = useEquipmentNavigation()

  const handleConfirmAction = async () => {
    const { equipmentId, action } = modalHooks.confirmModal
    if (equipmentId && action) {
      const status = action === "approve" ? "approved" : "rejected"
      await updateEquipmentStatus(equipmentId, status, undefined, t)
      modalHooks.closeConfirmModal()
    }
  }

  const handleReject = async (reason: string) => {
    const equipmentId = modalHooks.modals.rejection.equipmentId
    if (!equipmentId) return
    const success = await updateEquipmentStatus(equipmentId, "rejected", reason, t)
    if (success) modalHooks.closeRejectionModal()
  }

  return {
    ...navigationHooks,
    ...modalHooks,
    handleConfirmAction,
    handleReject,
  }
}

import { useEquipmentModals } from "./useEquipmentModals"
import { useEquipmentNavigation } from "./useEquipmentNavigation"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { EquipmentStatus } from "@/src/lib/types"
import { showToast } from "@/src/lib/toast"

export function useEquipmentActions(t: any) {
  const { updateEquipment, setUpdating, getEquipmentById } = useEquipmentStore()
  const modalHooks = useEquipmentModals()
  const navigationHooks = useEquipmentNavigation()

  const updateStatus = async (id: string, status: EquipmentStatus, reason?: string) => {
    setUpdating(id)
    try {
      const body: any = { status }
      if (status === "rejected" && reason) {
        body.rejectionReason = reason
      }
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        updateEquipment(id, {
          status,
          ...(reason && { rejectionReason: reason }),
        })
        showToast.success(
          t(status === "approved" ? "equipmentApproved" : "equipmentRejected"),
        )
        return true
      }
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } catch (error) {
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } finally {
      setUpdating(null)
    }
  }

  const updateAvailability = async (id: string, isAvailable: boolean) => {
    const original = getEquipmentById(id)
    setUpdating(id)
    updateEquipment(id, { isAvailable })
    
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      })
      if (response.ok) {
        showToast.success(t("availabilityUpdated"))
        return true
      }
      if (original) {
        updateEquipment(id, { isAvailable: original.isAvailable })
      }
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } catch (error) {
      if (original) {
        updateEquipment(id, { isAvailable: original.isAvailable })
      }
      showToast.error(t("equipmentUpdateFailed"))
      return false
    } finally {
      setUpdating(null)
    }
  }

  const handleConfirmAction = async () => {
    const { equipmentId, action } = modalHooks.confirmModal
    if (equipmentId && action) {
      const status = action === "approve" ? "approved" : "rejected"
      await updateStatus(equipmentId, status)
      modalHooks.closeConfirmModal()
    }
  }

  const handleReject = async (reason: string) => {
    const equipmentId = modalHooks.modals.rejection.equipmentId
    if (!equipmentId) return
    const success = await updateStatus(equipmentId, "rejected", reason)
    if (success) modalHooks.closeRejectionModal()
  }

  return {
    ...navigationHooks,
    ...modalHooks,
    handleConfirmAction,
    handleReject,
    updateAvailability,
  }
}

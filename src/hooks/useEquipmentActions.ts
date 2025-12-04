import { useState } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { showToast } from "@/src/lib/toast"

export function useEquipmentActions(
  handleStatusChange: (id: string, status: string) => Promise<boolean>,
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

  return {
    navigating,
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
    handleAvailabilityChangeWithToast,
    handleNavigation,
  }
}

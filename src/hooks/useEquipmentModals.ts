import { useState, useMemo } from "react"

export function useEquipmentModals() {
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
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    modals,
    handleStatusChangeCallback,
    handlePricingReview,
    closePricingModal,
    closeRejectionModal,
  }
}

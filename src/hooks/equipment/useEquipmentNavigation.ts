import { useState } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { useEquipmentStore } from "@/src/stores/equipmentStore"

export function useEquipmentNavigation() {
  const router = useRouter()
  const navigateToEquipment = useEquipmentStore(state => state.navigateToEquipment)
  const navigating = useEquipmentStore(state => state.navigating)

  const handleNavigation = (url: string, equipmentId: string) => {
    navigateToEquipment(url, equipmentId, router)
  }

  return {
    navigating,
    handleNavigation,
  }
}

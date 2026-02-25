import { useState } from "react"
import { useRouter } from "@/src/i18n/navigation"

export function useEquipmentNavigation() {
  const router = useRouter()
  const [navigating, setNavigating] = useState<string | null>(null)

  const handleNavigation = (url: string, equipmentId: string) => {
    setNavigating(equipmentId)
    router.push(url)
  }

  return {
    navigating,
    handleNavigation,
  }
}

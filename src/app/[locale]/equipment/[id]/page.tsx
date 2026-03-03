"use client"

import { useParams } from "next/navigation"
import { useEffect } from "react"
import EquipmentDetailsView from "@/src/components/equipment-details/EquipmentDetailsView"
import { useEquipmentStore } from "@/src/stores/equipmentStore"

export default function EquipmentDetailsPage() {
  const params = useParams()
  const equipmentId = params.id as string
  const resetNavigating = useEquipmentStore((state) => state.resetNavigating)

  useEffect(() => {
    resetNavigating()
  }, [])

  return <EquipmentDetailsView equipmentId={equipmentId} />
}

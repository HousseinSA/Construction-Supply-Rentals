"use client"

import { useParams } from "next/navigation"
import EquipmentDetailsView from "@/src/components/equipment-details/EquipmentDetailsView"

export default function EquipmentDetailsPage() {
  const params = useParams()
  const equipmentId = params.id as string

  return <EquipmentDetailsView equipmentId={equipmentId} />
}

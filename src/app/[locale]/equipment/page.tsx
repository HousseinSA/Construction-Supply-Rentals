"use client"

import { useSearchParams } from "next/navigation"
import { useEquipment } from "@/src/hooks/useEquipment"
import PageHeader from "@/src/components/equipment/PageHeader"
import EquipmentGrid from "@/src/components/equipment/EquipmentGrid"

export default function EquipmentPage() {
  const searchParams = useSearchParams()
  const selectedCity = searchParams.get("city")
  const { equipment, loading } = useEquipment(selectedCity)

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader selectedCity={selectedCity} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EquipmentGrid 
          equipment={equipment} 
          loading={loading} 
          selectedCity={selectedCity} 
        />
      </div>
    </div>
  )
}
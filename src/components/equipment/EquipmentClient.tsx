"use client"

import { useEquipment } from "@/src/hooks/useEquipment"
import PageHeader from "./PageHeader"
import EquipmentGrid from "./EquipmentGrid"

interface EquipmentClientProps {
  selectedCity: string | null
}

export default function EquipmentClient({ selectedCity }: EquipmentClientProps) {
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
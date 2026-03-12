"use client"

import { useEffect } from "react"
import { useEquipment } from "@/src/hooks/equipment/useEquipment"
import { useCityData } from "@/src/hooks/useCityData"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import PageHeader from "./PageHeader"
import EquipmentGrid from "./EquipmentGrid"

interface EquipmentClientProps {
  selectedCity: string | null
  selectedType?: string | null
  listingType?: string | null
}

export default function EquipmentClient({
  selectedCity: urlCity,
  selectedType,
  listingType,
}: EquipmentClientProps) {
  const { convertToLatin } = useCityData()
  const { setCurrentPage } = useEquipmentStore()

  useEffect(() => {
    setCurrentPage(1)
  }, [setCurrentPage])

  const currentCity = selectedType ? null : (urlCity ? convertToLatin(urlCity) : null)
  const { equipment, loading, loadingMore, hasMore, loadMore } = useEquipment(
    currentCity,
    selectedType,
    listingType
  )
  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        selectedCity={currentCity}
        selectedType={selectedType}
        listingType={listingType}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EquipmentGrid
          equipment={equipment}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          selectedCity={currentCity}
          listingType={listingType}
        />
      </div>
    </div>
  )
}

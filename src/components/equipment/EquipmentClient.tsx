"use client"

import { useEffect } from "react"
import { useEquipment } from "@/src/hooks/useEquipment"
import { useSearchStore } from "@/src/stores"
import { useCityData } from "@/src/hooks/useCityData"
import PageHeader from "./PageHeader"
import EquipmentGrid from "./EquipmentGrid"

interface EquipmentClientProps {
  selectedCity: string | null
  selectedType?: string | null
  listingType?: string | null
}

export default function EquipmentClient({ selectedCity: urlCity, selectedType, listingType }: EquipmentClientProps) {
  const { selectedCity, setSelectedCity } = useSearchStore()
  const { convertToLatin } = useCityData()
  
  useEffect(() => {
    if (urlCity) {
      const latinCity = convertToLatin(urlCity)
      if (latinCity !== selectedCity) {
        setSelectedCity(latinCity)
      }
    }
  }, [urlCity, selectedCity, setSelectedCity, convertToLatin])

  const currentCity = selectedType ? null : (selectedCity || urlCity)
  const { equipment, loading } = useEquipment(currentCity, selectedType, listingType)

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader selectedCity={currentCity} selectedType={selectedType} listingType={listingType} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EquipmentGrid
          equipment={equipment}
          loading={loading}
          selectedCity={currentCity}
          listingType={listingType}
        />
      </div>
    </div>
  )
}
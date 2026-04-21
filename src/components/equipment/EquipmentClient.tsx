"use client"

import { usePublicEquipment } from "@/src/hooks/equipment/usePublicEquipment"
import { useCityData } from "@/src/hooks/useCityData"
import PageHeader from "./PageHeader"
import PublicEquipmentList from "./PublicEquipmentList"
import ErrorState from "@/src/components/ui/ErrorState"

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

  const currentCity = selectedType ? null : (urlCity ? convertToLatin(urlCity) : null)
  const {
    loading,
    error,
    equipment,
    loadingMore,
    hasMore,
    loadMore,
    refetch,
  } = usePublicEquipment(currentCity, selectedType, listingType)

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        selectedCity={currentCity}
        selectedType={selectedType}
        listingType={listingType}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <PublicEquipmentList
            loading={loading}
            selectedCity={currentCity}
            listingType={listingType}
            equipment={equipment}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        )}
      </div>
    </div>
  )
}

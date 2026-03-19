import { useTranslations } from "next-intl"
import EquipmentCard from "./EquipmentCard"
import LoadingSkeleton from "./LoadingSkeleton"
import EmptyState from "@/components/ui/EmptyState"
import type { Equipment } from "@/src/lib/models/equipment"

interface EquipmentGridProps {
  equipment: Equipment[]
  loading: boolean
  selectedCity?: string | null
  listingType?: string | null
}

export default function EquipmentGrid({ 
  equipment, 
  loading,
  selectedCity, 
  listingType 
}: EquipmentGridProps) {
  const t = useTranslations("equipment")

  if (loading && equipment.length === 0) {
    return <LoadingSkeleton count={6} type="card" />
  }

  if (!loading && equipment.length === 0) {
    return <EmptyState type="equipment" selectedCity={selectedCity} listingType={listingType} />
  }

  return (
    <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch max-w-7xl mx-auto">
      {equipment.map((item) => (
        <EquipmentCard key={item._id?.toString()} equipment={item} />
      ))}
    </div>
  )
}
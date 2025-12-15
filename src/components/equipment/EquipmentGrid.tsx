import EquipmentCard from "./EquipmentCard"
import LoadingSkeleton from "./LoadingSkeleton"
import EmptyState from "@/components/ui/EmptyState"

interface Pricing {
  dailyRate?: number
  hourlyRate?: number
  kmRate?: number
}

interface Equipment {
  _id: string
  name: string
  description: string
  location: string
  pricing: Pricing
}

interface EquipmentGridProps {
  equipment: Equipment[]
  loading: boolean
  selectedCity?: string | null
  listingType?: string | null
}

export default function EquipmentGrid({ equipment, loading, selectedCity, listingType }: EquipmentGridProps) {
  if (loading) {
    const skeletonCount = equipment.length || 6
    return <LoadingSkeleton count={skeletonCount} type="card" />
  }

  if (equipment.length === 0) {
    return <EmptyState type="equipment" selectedCity={selectedCity} listingType={listingType} />
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-7xl mx-auto">
      {equipment.map((item) => (
        <EquipmentCard key={item._id} equipment={item} />
      ))}
    </div>
  )
}
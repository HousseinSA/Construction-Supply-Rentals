import EquipmentTypeCard from "./EquipmentTypeCard"
import LoadingSkeleton from "@/src/components/equipment/LoadingSkeleton"
import EmptyState from "@/components/ui/EmptyState"
import { EquipmentType } from "@/src/lib/models"

interface EquipmentTypeWithCount extends EquipmentType {
  equipmentCount?: number
}

interface EquipmentTypesGridProps {
  equipmentTypes: EquipmentTypeWithCount[]
  loading: boolean
  categoryImage: string
  getEquipmentTypeName: (name: string) => string
  getEquipmentTypeDesc: (name: string) => string
}

export default function EquipmentTypesGrid({
  equipmentTypes,
  loading,
  categoryImage,
  getEquipmentTypeName,
  getEquipmentTypeDesc,
}: EquipmentTypesGridProps) {
  if (loading) {
    const skeletonCount = equipmentTypes.length || 6
    return <LoadingSkeleton count={skeletonCount} type="card" />
  }

  if (equipmentTypes.length === 0) {
    return <EmptyState type="category" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
      {equipmentTypes.map((type) => (
        <EquipmentTypeCard
          key={type._id}
          type={type}
          categoryImage={categoryImage}
          getEquipmentTypeName={getEquipmentTypeName}
          getEquipmentTypeDesc={getEquipmentTypeDesc}
        />
      ))}
    </div>
  )
}
import EquipmentTypeCard from "./EquipmentTypeCard"
import LoadingSkeleton from "@/src/components/equipment/LoadingSkeleton"
import EmptyState from "./EmptyState"

interface EquipmentTypesGridProps {
  equipmentTypes: any[]
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
    return <LoadingSkeleton count={6} type="card" />
  }

  if (equipmentTypes.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {equipmentTypes.map((type: any) => (
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
"use client"

import { useParams } from "next/navigation"
import { useEquipmentTypes } from "@/src/hooks/useEquipmentTypes"
import { useCategoryMapping } from "@/src/hooks/useCategoryMapping"
import CategoryHeader from "@/src/components/category/CategoryHeader"
import EquipmentTypesGrid from "@/src/components/category/EquipmentTypesGrid"

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const { equipmentTypes, loading } = useEquipmentTypes(category)
  const { getCategoryInfo, getEquipmentTypeName, getEquipmentTypeDesc } = useCategoryMapping()
  
  const categoryInfo = getCategoryInfo(category)

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryHeader categoryInfo={categoryInfo} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EquipmentTypesGrid
          equipmentTypes={equipmentTypes}
          loading={loading}
          categoryImage={categoryInfo.image}
          getEquipmentTypeName={getEquipmentTypeName}
          getEquipmentTypeDesc={getEquipmentTypeDesc}
        />
      </div>
    </div>
  )
}
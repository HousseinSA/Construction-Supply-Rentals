import { useCityData } from "@/src/hooks/useCityData"
import { useTranslations, useLocale } from "next-intl"
import { useState, useEffect } from "react"
import BackButton from "@/components/ui/BackButton"

interface PageHeaderProps {
  selectedCity?: string | null
  selectedType?: string | null
  listingType?: string | null
}

export default function PageHeader({ selectedCity, selectedType, listingType }: PageHeaderProps) {
  const t = useTranslations("equipment")
  const commonT = useTranslations("common")
  const tCategories = useTranslations("categories.equipmentTypes")
  const locale = useLocale()
  const { getDisplayValue } = useCityData()
  const [equipmentTypeName, setEquipmentTypeName] = useState<string>('')

  useEffect(() => {
    if (selectedType) {
      fetch(`/api/equipment-types/${selectedType}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const typeName = data.data.name[locale as keyof typeof data.data.name] || data.data.name
            setEquipmentTypeName(typeName)
          }
        })
        .catch(console.error)
    }
  }, [selectedType, locale])

  const getTitle = () => {
    if (selectedType && equipmentTypeName) {
      return equipmentTypeName
    }
    const baseTitle = listingType === 'forSale' ? commonT("equipmentForSale") : t("allEquipment")
    if (listingType === 'forSale') {
      return baseTitle
    }
    return selectedCity ? `${baseTitle} - ${getDisplayValue(selectedCity)}` : baseTitle
  }

  return (
    <div className="relative h-32 bg-gradient-to-r from-primary to-primary-dark">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 text-white max-w-7xl mx-auto">
        <BackButton className="text-white" />
        
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {getTitle()}
          </h1>
        </div>
        
        <div className="w-16"></div>
      </div>
    </div>
  )
}
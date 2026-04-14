import { useCityData } from "@/src/hooks/useCityData"
import { useTranslations, useLocale } from "next-intl"
import { useState, useEffect } from "react"
import { useCategoryMapping } from "@/src/hooks/useCategoryMapping"
import PageBanner from "@/components/ui/PageBanner"


interface PageHeaderProps {
  selectedCity?: string | null
  selectedType?: string | null
  listingType?: string | null
}

export default function PageHeader({ selectedCity, selectedType, listingType }: PageHeaderProps) {
  const t = useTranslations("equipment")
  const commonT = useTranslations("common")
  const locale = useLocale()
  const { getDisplayValue } = useCityData()
  const [equipmentTypeName, setEquipmentTypeName] = useState<string>('')
const {getEquipmentTypeName} = useCategoryMapping()
  useEffect(() => {
    if (selectedType) {
      fetch(`/api/equipment-types/${selectedType}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
           const translatedName = getEquipmentTypeName(data.data.name)
            setEquipmentTypeName(translatedName)
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

  return <PageBanner title={getTitle()} />
}
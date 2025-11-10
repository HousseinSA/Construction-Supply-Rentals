import { useCityData } from "@/src/hooks/useCityData"
import { useTranslations } from "next-intl"
import { Search, Construction } from "lucide-react"

interface EmptyStateProps {
  type: "equipment" | "category"
  selectedCity?: string | null
  listingType?: string | null
  icon?: React.ReactNode
}

export default function EmptyState({
  type,
  selectedCity,
  listingType,
  icon,
}: EmptyStateProps) {
  const equipmentT = useTranslations("equipment")
  const categoryT = useTranslations("categories")
  const commonT = useTranslations("common")
  const { getDisplayValue } = useCityData()

  const getContent = () => {
    if (type === "equipment") {
      const isForSale = listingType === 'forSale'
      
      if (isForSale) {
        // For equipment for sale, don't show city-specific messages since we show all equipment for sale
        return {
          icon: icon || <Search size={64} className="text-gray-400" />,
          title: equipmentT("noEquipmentForSaleFound"),
          description: equipmentT("noEquipmentForSaleFoundDesc"),
        }
      } else {
        // For regular equipment (for rent), show city-specific messages if city is selected
        const baseTitle = equipmentT("noEquipmentFound")
        const baseTitleWithCity = equipmentT("noEquipmentInCity")
        const baseDesc = equipmentT("noEquipmentFoundDesc")
        const baseDescWithCity = `${equipmentT("noEquipmentInCityDesc")} ${getDisplayValue(selectedCity)}`
        
        return {
          icon: icon || <Search size={64} className="text-gray-400" />,
          title: selectedCity ? baseTitleWithCity : baseTitle,
          description: selectedCity ? baseDescWithCity : baseDesc,
        }
      }
    } else {
      return {
        icon: icon || <Construction size={64} className="text-gray-400" />,
        title: categoryT("noEquipmentTitle"),
        description: categoryT("noEquipmentMessage"),
      }
    }
  }

  const content = getContent()

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">{content.icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {content.title}
      </h3>
      <p className="text-gray-600">{content.description}</p>
    </div>
  )
}

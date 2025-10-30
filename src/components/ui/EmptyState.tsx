import { useCityData } from "@/src/hooks/useCityData"
import { useTranslations } from "next-intl"
import { Search, Construction } from "lucide-react"

interface EmptyStateProps {
  type: "equipment" | "category"
  selectedCity?: string | null
  icon?: React.ReactNode
}

export default function EmptyState({
  type,
  selectedCity,
  icon,
}: EmptyStateProps) {
  const equipmentT = useTranslations("equipment")
  const categoryT = useTranslations("categories")
  const { getDisplayValue } = useCityData()

  const getContent = () => {
    if (type === "equipment") {
      return {
        icon: icon || <Search size={64} className="text-gray-400" />,
        title: selectedCity
          ? equipmentT("noEquipmentInCity")
          : equipmentT("noEquipmentFound"),
        description: selectedCity
          ? `${equipmentT("noEquipmentInCityDesc")} ${getDisplayValue(
              selectedCity
            )}`
          : equipmentT("noEquipmentFoundDesc"),
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

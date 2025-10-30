import { useCityData } from "@/src/hooks/useCityData"
import { useTranslations } from "next-intl"
import BackButton from "@/components/ui/BackButton"

interface PageHeaderProps {
  selectedCity?: string | null
}

export default function PageHeader({ selectedCity }: PageHeaderProps) {
  const t = useTranslations("equipment")
  const { getDisplayValue } = useCityData()

  return (
    <div className="relative h-32 bg-gradient-to-r from-primary to-primary-dark">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 text-white max-w-7xl mx-auto">
        <BackButton className="text-white" />
        
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {selectedCity
              ? `${t("allEquipment")} - ${getDisplayValue(selectedCity)}`
              : t("allEquipment")}
          </h1>
        </div>
        
        <div className="w-16"></div>
      </div>
    </div>
  )
}
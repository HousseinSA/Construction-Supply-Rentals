import { Wrench, Clock, Weight } from "lucide-react"
import { useTranslations } from "next-intl"

interface Specifications {
  brand?: string
  model?: string
  condition?: string
  hoursUsed?: number
  weight?: number
  weightUnit?: string
}

interface SpecificationsGridProps {
  specifications: Specifications
}

export default function SpecificationsGrid({ specifications }: SpecificationsGridProps) {
  const t = useTranslations("equipmentDetails")

  if (!specifications || Object.keys(specifications).length === 0) {
    return null
  }

  return (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
        <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        {t("specifications")}
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
        {specifications.brand && (
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 mb-1">{t("brand")}</div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {specifications.brand}
            </div>
          </div>
        )}
        {specifications.model && (
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 mb-1">{t("model")}</div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {specifications.model}
            </div>
          </div>
        )}
        {specifications.condition && (
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 mb-1">{t("condition")}</div>
            <div className="font-semibold text-sm sm:text-base text-gray-900 capitalize">
              {specifications.condition}
            </div>
          </div>
        )}
        {specifications.hoursUsed && (
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t("hoursUsed")}
            </div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {specifications.hoursUsed}h
            </div>
          </div>
        )}
        {specifications.weight && (
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <Weight className="w-3 h-3" />
              {t("weight")}
            </div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {specifications.weight} {specifications.weightUnit || "kg"}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

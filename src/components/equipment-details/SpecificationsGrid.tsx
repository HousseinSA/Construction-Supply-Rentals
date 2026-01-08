import { Wrench, Clock, Weight, Gauge, Tag, Box, CheckCircle } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

interface Specifications {
  brand?: string
  model?: string
  condition?: string
  hoursUsed?: number
  kilometersUsed?: number
  weight?: number
  weightUnit?: string
  usageValue?: number
  usageUnit?: string
  usageCategory?: "hours" | "kilometers" | "tonnage"
}

interface SpecificationsGridProps {
  specifications: Specifications
  isForSale?: boolean
}

export default function SpecificationsGrid({
  specifications,
  isForSale,
}: SpecificationsGridProps) {
  const t = useTranslations("equipmentDetails")
  const locale = useLocale()

  const getUnitText = (unit: string) => {
    if (unit === "tons") return t("units.tons")
    if (unit === "kg") return t("units.kg")
    if (unit === "km") return t("units.km")
    if (unit === "hours") return t("units.hours")
    return unit
  }

  const formatUsage = (value: number, unit: string) => {
    const formattedValue = value.toLocaleString()
    const unitText = unit === "km" ? t("units.km") : t("units.hours")
    return locale === "ar" ? `${formattedValue} ${unitText}` : `${formattedValue} ${unitText}`
  }

  const formatWeight = (value: number, unit: string) => {
    const formattedValue = value.toLocaleString()
    const unitText = getUnitText(unit || "kg")
    return locale === "ar" ? `${formattedValue} ${unitText}` : `${formattedValue} ${unitText}`
  }

  const getConditionLabel = (condition: string) => {
    return t(`conditionLabels.${condition}`) || condition
  }

  if (!specifications || Object.keys(specifications).length === 0) {
    return null
  }

  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        {t("specifications")}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs sm:text-sm text-primary mb-1 flex items-center gap-1 font-bold">
            <Tag className="w-3 h-3" />
            {t("brand")}
          </div>
          <div className="font-semibold text-sm sm:text-base text-gray-900 break-words">
            {specifications.brand || "-"}
          </div>
        </div>
        {specifications.model && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-primary mb-1 flex items-center gap-1 font-bold">
              <Box className="w-3 h-3" />
              {t("model")}
            </div>
            <div className="font-semibold text-sm sm:text-base text-gray-900 break-words">
              {specifications.model}
            </div>
          </div>
        )}
        {isForSale ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-primary mb-1 flex items-center gap-1 font-bold">
              <CheckCircle className="w-3 h-3" />
              {t("condition")}
            </div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {specifications.condition
                ? getConditionLabel(specifications.condition)
                : "-"}
            </div>
          </div>
        ) : (
          specifications.condition && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs sm:text-sm text-primary mb-1 flex items-center gap-1 font-bold">
                <CheckCircle className="w-3 h-3" />
                {t("condition")}
              </div>
              <div className="font-semibold text-sm sm:text-base text-gray-900">
                {getConditionLabel(specifications.condition)}
              </div>
            </div>
          )
        )}
        {(specifications.usageValue || specifications.hoursUsed) && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-primary mb-1 flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3" />
              ODO
            </div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {specifications.usageValue
                ? formatUsage(
                    specifications.usageValue,
                    specifications.usageUnit || "hours"
                  )
                : formatUsage(specifications.hoursUsed!, "hours")}
            </div>
          </div>
        )}
        {specifications.kilometersUsed && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-primary mb-1 flex items-center gap-1 font-bold">
              <Gauge className="w-3 h-3" />
              ODO
            </div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {specifications.kilometersUsed.toLocaleString()} {t("units.km")}
            </div>
          </div>
        )}
        {specifications.weight && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs sm:text-sm text-primary mb-1 flex items-center gap-1 font-bold">
              <Weight className="w-3 h-3" />
              {t("weight")}
            </div>
            <div className="font-semibold text-sm sm:text-base text-gray-900">
              {formatWeight(
                specifications.weight,
                specifications.weightUnit || "kg"
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

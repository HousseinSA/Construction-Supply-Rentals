import { Wrench, Clock, Weight } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

interface Specifications {
  brand?: string
  model?: string
  condition?: string
  hoursUsed?: number
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

export default function SpecificationsGrid({ specifications, isForSale }: SpecificationsGridProps) {
  const t = useTranslations("equipmentDetails")
  const locale = useLocale()
  
  const getUnitText = (unit: string) => {
    if (unit === 'tons') return t('units.tons')
    if (unit === 'kg') return t('units.kg')
    if (unit === 'km') return t('units.km')
    if (unit === 'hours') return t('units.hours')
    return unit
  }
  
  const formatUsage = (value: number, unit: string) => {
    const unitText = unit === 'km' ? t('units.km') : t('units.hours')
    return locale === 'ar' ? `${value} ${unitText}` : `${value} ${unitText}`
  }
  
  const formatWeight = (value: number, unit: string) => {
    const unitText = getUnitText(unit || 'kg')
    return locale === 'ar' ? `${value} ${unitText}` : `${value} ${unitText}`
  }

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
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-gray-500 mb-1">{t("brand")}</div>
          <div className="font-semibold text-sm sm:text-base text-gray-900">
            {specifications.brand || '-'}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-gray-500 mb-1">{t("model")}</div>
          <div className="font-semibold text-sm sm:text-base text-gray-900">
            {specifications.model || '-'}
          </div>
        </div>
        {isForSale && (
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
            <div className="text-xs text-gray-500 mb-1">{t("condition")}</div>
            <div className="font-semibold text-sm sm:text-base text-gray-900 capitalize">
              {specifications.condition || '-'}
            </div>
          </div>
        )}
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {t("equipmentUsage")}
          </div>
          <div className="font-semibold text-sm sm:text-base text-gray-900">
            {specifications.usageValue 
              ? formatUsage(specifications.usageValue, specifications.usageUnit || 'hours')
              : specifications.hoursUsed
              ? formatUsage(specifications.hoursUsed, 'hours')
              : '-'
            }
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <Weight className="w-3 h-3" />
            {t("weight")}
          </div>
          <div className="font-semibold text-sm sm:text-base text-gray-900">
            {specifications.weight ? formatWeight(specifications.weight, specifications.weightUnit || 'kg') : '-'}
          </div>
        </div>
      </div>
    </div>
  )
}

import { memo } from "react"
import { useLocale, useTranslations } from "next-intl"

interface PriceCalculationProps {
  rate: number
  unit: string
  usage: number
  subtotal: number
}

function PriceCalculation({
  rate,
  unit,
  usage,
  subtotal,
}: PriceCalculationProps) {
const t  = useTranslations("booking")
const locale = useLocale()
const isRTL = locale === 'ar'
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between text-sm items-center">
        <div className="text-gray-600" dir="ltr">
         <span dir={`${isRTL && 'rtl'}`}>{usage} {unit}</span>   × {rate.toLocaleString()} MRU
        </div>
      </div>
      <div className="border-t border-gray-200 pt-2 flex justify-between">
        <span className="font-semibold text-gray-900">{t("estimatedTotal")}:</span>
        <span className="font-bold text-primary text-lg"  dir="ltr">{subtotal.toLocaleString()} MRU</span>
      </div>
    </div>
  )
}

export default memo(PriceCalculation)

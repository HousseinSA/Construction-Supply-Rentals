import { Calculator } from "lucide-react"
import { useLocale } from "next-intl"

interface PriceCalculationProps {
  rate: number
  unit: string
  usage: number
  usageLabel: string
  subtotal: number
  labels: {
    calculation: string
    rate: string
    usage: string
    total: string
  }
}

export default function PriceCalculation({
  rate,
  unit,
  usage,
  usageLabel,
  subtotal,
  labels,
}: PriceCalculationProps) {
  const locale = useLocale()
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-blue-900">{labels.calculation}</span>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>{labels.rate}</span>
          <div>
            <span className="font-medium " dir="ltr">
              {rate.toLocaleString()} MRU
            </span>
            <span>{" / "} </span>
            <span dir={locale === "ar" ? "rtl" : "ltr"}>{unit}</span>{" "}
          </div>
        </div>
        <div className="flex justify-between">
          <span>{labels.usage}</span>
          <span>
            {usage} {usageLabel}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-blue-900 pt-2 border-t">
          <span>{labels.total}</span>
          <span className="text-lg" dir="ltr">
            {subtotal.toLocaleString()} MRU
          </span>
        </div>
      </div>
    </div>
  )
}

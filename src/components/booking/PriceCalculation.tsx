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
      <div className="mb-3">
        <span className="font-medium text-blue-900">{labels.calculation}</span>
      </div>
      <div className="text-sm space-y-1">
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

import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"

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
  const { formatPrice } = usePriceFormatter()
  const { displayPrice: rateDisplay, displayUnit } = formatPrice(rate, unit)
  const { displayPrice: totalDisplay } = formatPrice(subtotal, "")

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <div className="mb-3">
        <span className="font-medium text-blue-900">{labels.calculation}</span>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>{labels.rate}</span>
          <span dir="ltr">
            {rateDisplay} / {usageLabel}
          </span>
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
            {totalDisplay}
          </span>
        </div>
      </div>
    </div>
  )
}

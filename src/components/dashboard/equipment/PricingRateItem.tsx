import CustomCheckbox from "@/src/components/ui/CustomCheckbox"

interface PricingRateItemProps {
  rateKey: string
  value: number
  label: string
  isSelected: boolean
  onToggle: () => void
  formatPrice: (price: number) => string
  type: "new" | "changed"
  oldValue?: number
  isRTL?: boolean
  newLabel?: string
}

export default function PricingRateItem({
  rateKey,
  value,
  label,
  isSelected,
  onToggle,
  formatPrice,
  type,
  oldValue,
  isRTL = false,
  newLabel,
}: PricingRateItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-200 last:border-0">
      <CustomCheckbox checked={isSelected} onChange={onToggle} />
      <div className="flex items-center justify-between flex-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-3">
          {type === "new" ? (
            <>
              <span className="text-sm text-green-600 font-medium">{newLabel}</span>
              <span className="text-lg font-bold text-primary" dir="ltr">
                {formatPrice(value)} MRU
              </span>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-500 line-through" dir="ltr">
                {formatPrice(oldValue!)} MRU
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 ${isRTL ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              <span className="text-lg font-bold text-primary" dir="ltr">
                {formatPrice(value)} MRU
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

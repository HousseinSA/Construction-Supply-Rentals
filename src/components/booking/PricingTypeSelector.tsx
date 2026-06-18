import { memo } from "react"
import { PricingType } from "@/src/lib/types"

interface PricingTypeSelectorProps {
  types: Array<{ type: PricingType; label: string; rate: number }>
  selected: PricingType
  onChange: (type: PricingType) => void
  label: string
}

function PricingTypeSelector({ types, selected, onChange, label }: PricingTypeSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-3">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {types.map((pricing) => (
          <button
            key={pricing.type}
            type="button"
            onClick={() => onChange(pricing.type)}
            className={`flex-1 min-w-[100px] p-3 rounded-xl border-2 transition-all ${
              selected === pricing.type
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex flex-col items-center gap-0.5" dir="ltr">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-gray-900">
                  {pricing.rate.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  MRU
                </span>
              </div>
              <span className="text-xs font-medium text-gray-500">
                / {pricing.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(PricingTypeSelector)

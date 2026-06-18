import { memo } from "react"
import Input from "@/src/components/ui/Input"
import { PricingType } from "@/src/lib/types"

interface BookingUsageInputProps {
  value: number
  onChange: (value: number) => void
  unit: string
  rate: number
  pricingType: PricingType
  distanceLabel: string
  usageLabel: string
  rateLabel: string
}

function BookingUsageInput({
  value,
  onChange,
  unit,
  rate,
  pricingType,
  distanceLabel,
  usageLabel,
  rateLabel,
}: BookingUsageInputProps) {
  const label = pricingType === "per_km" ? distanceLabel : usageLabel

  return (
    <>
      <Input
        type="text"
        label={`${label} (${unit})`}
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "")
          onChange(val ? Number(val) : 0)
        }}
        required
      />
      {pricingType === "per_km" && (
        <div className="-mt-2 text-sm text-gray-600">
          {rateLabel}:{" "}
          <span dir="ltr">
            {rate.toLocaleString()} MRU/{unit}
          </span>
        </div>
      )}
    </>
  )
}

export default memo(BookingUsageInput)

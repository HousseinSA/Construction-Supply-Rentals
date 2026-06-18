import { memo } from "react"
import DatePicker from "@/src/components/ui/DatePicker"
import { PricingType } from "@/src/lib/types"

interface BookingDateSelectorProps {
  pricingType: PricingType
  startDate: string
  endDate: string
  onDateChange: (start: string, end: string) => void
  bookedRanges: Array<{ start: Date | string; end: Date | string }>
  label: string
  startLabel: string
}

function BookingDateSelector({
  pricingType,
  startDate,
  endDate,
  onDateChange,
  bookedRanges,
  label,
  startLabel,
}: BookingDateSelectorProps) {
  if (pricingType === "daily") {
    return (
      <DatePicker
        startDate={startDate}
        endDate={endDate}
        onDateChange={(start, end) => onDateChange(start, end)}
        label={label}
        required
        showRange
        bookedRanges={bookedRanges}
      />
    )
  }

  return (
    <DatePicker
      startDate={startDate}
      endDate=""
      onDateChange={(start) => onDateChange(start, "")}
      label={startLabel}
      required
      showRange={false}
      bookedRanges={bookedRanges}
    />
  )
}

export default memo(BookingDateSelector)

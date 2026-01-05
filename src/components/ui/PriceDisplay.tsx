import React from "react"

interface PriceDisplayProps {
  amount: number
  showMRU?: boolean
  mruClassName?: string
  amountClassName?: string
  dir?: "ltr" | "rtl"
  suffix?: string
  variant?: "default" | "commission"
}


export default function PriceDisplay({
  amount,
  showMRU = true,
  mruClassName = "text-sm text-gray-500",
  amountClassName,
  dir = "ltr",
  suffix = "",
  variant = "default"
}: PriceDisplayProps) {
  const defaultAmountClassName = variant === "commission" 
    ? "font-semibold text-sm text-green-600"
    : "font-semibold text-sm text-gray-900"
  
  const finalAmountClassName = amountClassName || defaultAmountClassName
  return (
    <span dir={dir} className="inline-flex  items-baseline gap-1">
      <span className={finalAmountClassName}>
        {amount.toLocaleString()}
      </span>
      {showMRU && (
        <span className={mruClassName}>
          MRU{suffix}
        </span>
      )}
    </span>
  )
}

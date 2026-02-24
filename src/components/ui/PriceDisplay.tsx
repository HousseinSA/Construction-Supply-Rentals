import React from "react"

interface PriceDisplayProps {
  amount: number
  showMRU?: boolean
  amountClassName?: string
  dir?: "ltr" | "rtl"
  suffix?: string
  variant?: "default" | "commission"
}

export default function PriceDisplay({
  amount,
  showMRU = true,
  amountClassName,
  dir = "ltr",
  suffix = "",
  variant = "default",
}: PriceDisplayProps) {
  const getRateColor = (suffix: string) => {
    const normalizedSuffix = suffix.toLowerCase()
    const ratePatterns = [
      { keywords: ['hour', 'heure', 'ساعة'], color: 'text-orange-500' },
      { keywords: ['day', 'jour', 'يوم'], color: 'text-blue-600' },
      { keywords: ['month', 'mois', 'شهر'], color: 'text-teal-600' },
      { keywords: ['km'], color: 'text-emerald-500' },
      { keywords: ['ton', 'tonne', 'طن'], color: 'text-gray-600' },
    ]
    
    for (const pattern of ratePatterns) {
      if (pattern.keywords.some(keyword => normalizedSuffix.includes(keyword))) {
        return pattern.color
      }
    }
    
    return suffix === "" ? "text-primary" : "text-gray-700"
  }

  const rateColor = getRateColor(suffix)
  
  const defaultAmountClassName =
    variant === "commission"
      ? "font-semibold text-sm text-green-600"
      : `font-semibold text-sm ${rateColor}`

  const finalAmountClassName = amountClassName || defaultAmountClassName
  const displayAmount = amount ?? 0

  return (
    <span dir={dir} className="inline-flex items-baseline gap-1">
      <span className={finalAmountClassName}>
        {displayAmount.toLocaleString()}
      </span>
      {showMRU && <span className={`text-sm font-medium ${rateColor}`}>MRU{suffix}</span>}
    </span>
  )
}

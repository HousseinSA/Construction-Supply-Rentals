"use client"

import { useTranslations } from "next-intl"

interface PricingDisplayProps {
  pricing: {
    hourlyRate?: number
    dailyRate?: number
    kmRate?: number
    salePrice?: number
  }
  isForSale: boolean
  displayPrice: string
}

export default function PricingDisplay({ pricing, isForSale, displayPrice }: PricingDisplayProps) {
  const tCommon = useTranslations("common")
  const t = useTranslations("equipment")

  if (isForSale) {
    return (
      <div className="text-center">
        <div className="text-base font-bold text-primary" dir="ltr">
          {displayPrice}
        </div>
        <div className="text-xs text-gray-500">{t("salePrice")}</div>
      </div>
    )
  }

  return (
    <div className="flex items-baseline justify-around gap-3 text-sm flex-wrap">
      {pricing.hourlyRate && (
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-primary" dir="ltr">
            {pricing.hourlyRate.toLocaleString()} MRU
          </span>
          <span className="text-xs text-gray-500">/ {tCommon("hour")}</span>
        </div>
      )}
      {pricing.dailyRate && (
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-primary" dir="ltr">
            {pricing.dailyRate.toLocaleString()} MRU
          </span>
          <span className="text-xs text-gray-500">/ {tCommon("day")}</span>
        </div>
      )}
      {pricing.kmRate && (
        <div className="flex items-baseline gap-1">
          <span className="font-bold text-primary" dir="ltr">
            {pricing.kmRate.toLocaleString()} MRU
          </span>
          <span className="text-xs text-gray-500">/ {tCommon("km")}</span>
        </div>
      )}
    </div>
  )
}

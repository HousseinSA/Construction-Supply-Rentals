import { useTranslations, useLocale } from "next-intl"

interface Pricing {
  dailyRate?: number
  hourlyRate?: number
  monthlyRate?: number
  kmRate?: number
  salePrice?: number
}

interface PriceData {
  rate: number
  unit: string
}

export function usePriceFormatter() {
  const tCommon = useTranslations("common")
  const locale = useLocale()

  const getPriceData = (pricing: Pricing, isForSale?: boolean): PriceData => {
    if (!pricing) {
      return { rate: 0, unit: tCommon("day") }
    }

    if (isForSale && pricing.salePrice) {
      return { rate: pricing.salePrice, unit: "" }
    }

    const rate = pricing.dailyRate || pricing.monthlyRate || pricing.hourlyRate || pricing.kmRate || 0
    const unit = pricing.dailyRate
      ? tCommon("day")
      : pricing.monthlyRate
      ? tCommon("month")
      : pricing.hourlyRate
      ? tCommon("hour")
      : pricing.kmRate
      ? tCommon("km")
      : tCommon("day")

    return { rate, unit }
  }

  const formatPrice = (rate: number, unitType: string) => {
    const isArabic = locale === "ar"
    
    let translatedUnit = ""
    if (unitType === "hour") translatedUnit = tCommon("hour")
    else if (unitType === "day") translatedUnit = tCommon("day")
    else if (unitType === "month") translatedUnit = tCommon("month")
    else if (unitType === "km") translatedUnit = tCommon("km")
    else if (unitType === "ton") translatedUnit = tCommon("ton")
    
    if (isArabic) {
      return {
        formattedRate: rate.toLocaleString(),
        displayPrice: `${rate.toLocaleString()} MRU`,
        displayUnit: translatedUnit ? `/ ${translatedUnit}` : ""
      }
    }
    
    return {
      formattedRate: rate.toLocaleString(),
      displayPrice: `${rate.toLocaleString()} MRU `,
      displayUnit: translatedUnit ? `/ ${translatedUnit}` : ""
    }
  }

  return { getPriceData, formatPrice }
}

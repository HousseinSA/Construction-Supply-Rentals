import { useTranslations } from "next-intl"

interface Pricing {
  dailyRate?: number
  hourlyRate?: number
  kmRate?: number
  salePrice?: number
}

interface PriceData {
  rate: number
  unit: string
}

export function usePriceFormatter() {
  const tCommon = useTranslations("common")

  const getPriceData = (pricing: Pricing, isForSale?: boolean): PriceData => {
    if (!pricing) {
      return { rate: 0, unit: tCommon("day") }
    }

    if (isForSale && pricing.salePrice) {
      return { rate: pricing.salePrice, unit: "" }
    }

    const rate = pricing.dailyRate || pricing.hourlyRate || pricing.kmRate || 0
    const unit = pricing.dailyRate
      ? tCommon("day")
      : pricing.hourlyRate
      ? tCommon("hour")
      : pricing.kmRate
      ? tCommon("km")
      : tCommon("day")

    return { rate, unit }
  }

  const formatPrice = (rate: number, unit: string) => {
    return {
      formattedRate: rate.toLocaleString(),
      displayPrice: `${rate.toLocaleString()} ${tCommon("currency")}`,
      displayUnit: unit ? `/ ${unit}` : ""
    }
  }

  return { getPriceData, formatPrice }
}

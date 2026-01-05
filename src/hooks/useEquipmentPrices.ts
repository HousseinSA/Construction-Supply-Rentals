import { useTranslations } from "next-intl"
import type { Equipment } from "@/src/lib/models/equipment"

interface PriceItem {
  amount: number
  suffix: string
}

export const useEquipmentPrices = (equipment: Equipment): PriceItem[] => {
  const tCommon = useTranslations("common")
  
  const prices: PriceItem[] = []
  
  if (equipment.listingType === "forSale" && equipment.pricing.salePrice) {
    prices.push({ amount: equipment.pricing.salePrice, suffix: "" })
  } else {
    if (equipment.pricing.hourlyRate) {
      prices.push({ amount: equipment.pricing.hourlyRate, suffix: ` / ${tCommon("hour")}` })
    }
    if (equipment.pricing.dailyRate) {
      prices.push({ amount: equipment.pricing.dailyRate, suffix: ` / ${tCommon("day")}` })
    }
    if (equipment.pricing.kmRate) {
      prices.push({ amount: equipment.pricing.kmRate, suffix: ` / ${tCommon("km")}` })
    }
    if (equipment.pricing.tonRate) {
      prices.push({ amount: equipment.pricing.tonRate, suffix: ` / ${tCommon("ton")}` })
    }
  }
  
  return prices
}

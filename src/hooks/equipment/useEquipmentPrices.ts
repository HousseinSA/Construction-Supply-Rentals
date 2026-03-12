import { useTranslations } from "next-intl"
import type { Equipment } from "@/src/lib/models/equipment"

interface PriceItem {
  amount: number
  suffix: string
}

export const useEquipmentPrices = (equipment: Equipment, showPending: boolean = false): PriceItem[] => {
  const tCommon = useTranslations("common")
  
  const prices: PriceItem[] = []
  
  const pricing = equipment.pricing
  if (equipment.listingType === "forSale") {
    const salePrice = pricing.salePrice
    if (salePrice) {
      prices.push({ amount: salePrice, suffix: "" })
    }
  } else {
    const hourlyRate = pricing.hourlyRate
    const dailyRate = pricing.dailyRate
    const monthlyRate = pricing.monthlyRate
    const kmRate = pricing.kmRate
    const tonRate = pricing.tonRate
    
    if (hourlyRate) {
      prices.push({ amount: hourlyRate, suffix: ` / ${tCommon("hour")}` })
    }
    if (dailyRate) {
      prices.push({ amount: dailyRate, suffix: ` / ${tCommon("day")}` })
    }
    if (monthlyRate) {
      prices.push({ amount: monthlyRate, suffix: ` / ${tCommon("month")}` })
    }
    if (kmRate) {
      prices.push({ amount: kmRate, suffix: ` / ${tCommon("km")}` })
    }
    if (tonRate) {
      prices.push({ amount: tonRate, suffix: ` / ${tCommon("ton")}` })
    }
  }
  
  return prices
}

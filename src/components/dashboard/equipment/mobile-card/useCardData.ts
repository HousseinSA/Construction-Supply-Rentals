import { useTranslations } from "next-intl"
import { useMemo } from "react"

const PRICE_FIELDS = [
  { key: 'hourlyRate', unit: 'hour' },
  { key: 'dailyRate', unit: 'day' },
  { key: 'monthlyRate', unit: 'month' },
  { key: 'kmRate', unit: 'km' },
  { key: 'tonRate', unit: 'ton' }
] as const

export function useCardData(item: any) {
  const tCommon = useTranslations("common")
  
  const pricesList = useMemo(() => {
    if (item.listingType === "forSale" && item.pricing.salePrice) {
      return [{ amount: item.pricing.salePrice, suffix: "" }]
    }
    return PRICE_FIELDS
      .filter(({ key }) => item.pricing[key])
      .map(({ key, unit }) => ({ amount: item.pricing[key], suffix: ` / ${tCommon(unit)}` }))
  }, [item.listingType, item.pricing, tCommon])

  const supplierName = useMemo(() => 
    item.createdBy === "admin" ? tCommon("admin")
    : item.supplier ? `${item.supplier.firstName} ${item.supplier.lastName}`
    : "-"
  , [item.createdBy, item.supplier, tCommon])

  const cardBorderClass = useMemo(() => 
    item.pendingPricing ? 'border-orange-400 border-2 bg-orange-50'
    : item.rejectedPricingValues && Object.keys(item.rejectedPricingValues).length > 0
    ? 'border-red-400 border-2 bg-red-50'
    : 'border-gray-200'
  , [item.pendingPricing, item.rejectedPricingValues])

  return { pricesList, supplierName, cardBorderClass }
}

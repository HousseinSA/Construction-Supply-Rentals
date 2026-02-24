export const RATE_TYPES = [
  "hourlyRate",
  "dailyRate", 
  "monthlyRate",
  "kmRate",
  "tonRate",
  "salePrice"
] as const

export type RateType = typeof RATE_TYPES[number]

export function buildPriceChanges(
  currentPricing: any,
  pendingPricing: any,
  translationFn: (key: string) => string
) {
  const changes = []
  
  const rateKeys: RateType[] = ["hourlyRate", "dailyRate", "monthlyRate", "kmRate", "tonRate"]
  
  for (const key of rateKeys) {
    if (pendingPricing[key] && pendingPricing[key] !== currentPricing[key]) {
      changes.push({
        label: translationFn(key),
        current: currentPricing[key],
        pending: pendingPricing[key],
        isNew: !currentPricing[key] || currentPricing[key] === 0,
      })
    }
  }
  
  return changes
}

export function getPriceSuffix(key: string, tCommon: (key: string) => string): string {
  const suffixMap: Record<string, string> = {
    hourlyRate: `/${tCommon("hour")}`,
    dailyRate: `/${tCommon("day")}`,
    monthlyRate: `/${tCommon("month")}`,
    kmRate: `/${tCommon("km")}`,
    tonRate: `/${tCommon("ton")}`,
    salePrice: ""
  }
  return suffixMap[key] || ""
}

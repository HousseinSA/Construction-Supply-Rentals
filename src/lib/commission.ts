export function calculateCommission(subtotal: number, usage: number, pricingType?: string): number {
  let rate = 0.10 // 10% standard

  if (pricingType === 'hourly') {
    // Hourly pricing: hours-based tiers
    if (usage >= 1000) rate = 0.08
    else if (usage >= 500) rate = 0.09
    else rate = 0.10
  } else if (pricingType === 'daily') {
    // Daily pricing (Transport/Camion): month-based tiers
    const months = usage / 30
    if (months >= 2) rate = 0.08
    else if (months >= 1) rate = 0.09
    else rate = 0.10
  } else if (pricingType === 'per_km' || pricingType === 'per_ton') {
    // KM and Ton pricing: flat 10%
    rate = 0.10
  } else {
    // Fallback to hours-based for backward compatibility
    if (usage >= 1000) rate = 0.08
    else if (usage >= 500) rate = 0.09
    else rate = 0.10
  }

  return subtotal * rate
}

export function calculateBookingCommission(bookingItems: any[]): number {
  return bookingItems.reduce((sum, item) => 
    sum + calculateCommission(item.subtotal, item.usage, item.pricingType), 0
  )
}

export function calculateSaleCommission(salePrice: number): number {
  return salePrice * 0.05 // 5% fixed for sales
}

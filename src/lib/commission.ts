export function calculateCommission(subtotal: number, usage: number, pricingType?: string): number {
  return subtotal * 0.10
}

export function calculateBookingCommission(bookingItems: any[]): number {
  return bookingItems.reduce((sum, item) => 
    sum + calculateCommission(item.subtotal, item.usage, item.pricingType), 0
  )
}

export function calculateSaleCommission(salePrice: number): number {
  return salePrice * 0.05 // 5% fixed for sales
}

export function calculateCommission(subtotal: number, usage: number): number {
  let rate = 0.10 // 10% standard
  if (usage >= 1000) rate = 0.08 // 8% for 1000+ hours
  else if (usage >= 500) rate = 0.09 // 9% for 500+ hours
  return subtotal * rate
}

export function calculateBookingCommission(bookingItems: any[]): number {
  return bookingItems.reduce((sum, item) => 
    sum + calculateCommission(item.subtotal, item.usage), 0
  )
}

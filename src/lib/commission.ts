export function calculateCommission(subtotal: number): number {
  return subtotal * 0.10
}

export function calculateSaleCommission(salePrice: number): number {
  return salePrice * 0.05
}

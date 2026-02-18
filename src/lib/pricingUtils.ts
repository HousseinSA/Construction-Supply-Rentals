export function getRateLabel(key: string, t: (key: string) => string): string {
  const labelMap: Record<string, string> = {
    hourlyRate: t("hourly"),
    dailyRate: t("daily"),
    monthlyRate: t("monthly"),
    kmRate: t("perKm"),
    tonRate: t("tonRate"),
    salePrice: t("salePrice"),
  }
  return labelMap[key] || key
}

export function formatPrice(price: number | undefined): string {
  if (!price) return "-"
  return new Intl.NumberFormat("en-US").format(price)
}

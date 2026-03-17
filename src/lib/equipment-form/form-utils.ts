// Helper utilities for form data mapping

export const toStringOrEmpty = (value: any): string => {
  return value ? String(value) : ""
}

export const mapPricingToForm = (pricing: any) => ({
  hourlyRate: toStringOrEmpty(pricing.hourlyRate),
  dailyRate: toStringOrEmpty(pricing.dailyRate),
  monthlyRate: toStringOrEmpty(pricing.monthlyRate),
  kmRate: toStringOrEmpty(pricing.kmRate),
  tonRate: toStringOrEmpty(pricing.tonRate),
  salePrice: toStringOrEmpty(pricing.salePrice),
})

export const mapSpecificationsToForm = (specifications: any) => ({
  brand: specifications?.brand || "",
  model: specifications?.model || "",
  year: toStringOrEmpty(specifications?.year),
  condition: specifications?.condition || "",
  usageUnit: specifications?.usageUnit || "hours",
  weight: toStringOrEmpty(specifications?.weight),
  weightUnit: specifications?.weightUnit || "kg",
})

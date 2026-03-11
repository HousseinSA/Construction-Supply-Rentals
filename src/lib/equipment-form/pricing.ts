import type { Equipment } from "@/src/lib/models/equipment"
import type { FormData } from "./validation"

export function buildPricingFromForm(formData: FormData): Record<string, number> {
  const pricing: Record<string, number> = {}

  if (formData.listingType === "forSale") {
    pricing.salePrice = parseFloat(formData.salePrice)
  } else {
    if (formData.hourlyRate) pricing.hourlyRate = parseFloat(formData.hourlyRate)
    if (formData.dailyRate) pricing.dailyRate = parseFloat(formData.dailyRate)
    if (formData.monthlyRate) pricing.monthlyRate = parseFloat(formData.monthlyRate)
    if (formData.kmRate) pricing.kmRate = parseFloat(formData.kmRate)
    if (formData.tonRate) pricing.tonRate = parseFloat(formData.tonRate)
  }

  return pricing
}

export function normalizePricing(p: any): Record<string, number> {
  const normalized: Record<string, number> = {}
  if (p.hourlyRate) normalized.hourlyRate = parseFloat(String(p.hourlyRate))
  if (p.dailyRate) normalized.dailyRate = parseFloat(String(p.dailyRate))
  if (p.monthlyRate) normalized.monthlyRate = parseFloat(String(p.monthlyRate))
  if (p.kmRate) normalized.kmRate = parseFloat(String(p.kmRate))
  if (p.tonRate) normalized.tonRate = parseFloat(String(p.tonRate))
  if (p.salePrice) normalized.salePrice = parseFloat(String(p.salePrice))
  return normalized
}

export function getChangedPricing(
  currentPricing: Equipment["pricing"],
  newPricing: Record<string, number>,
): Record<string, number> | null {
  const current = normalizePricing(currentPricing)
  const updated = normalizePricing(newPricing)

  const changedPricing: Record<string, number> = {}
  Object.keys(updated).forEach((key) => {
    if (updated[key] !== current[key]) {
      changedPricing[key] = updated[key]
    }
  })

  return Object.keys(changedPricing).length > 0 ? changedPricing : null
}

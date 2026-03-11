import type { FormData } from "./validation"

export function buildSpecificationsFromForm(formData: FormData): Record<string, any> {
  const specifications: Record<string, any> = {
    brand: formData.brand.trim(),
  }

  if (formData.model) specifications.model = formData.model.trim()
  if (formData.year) specifications.year = parseInt(formData.year)
  if (formData.condition) specifications.condition = formData.condition
  
  if (formData.weight) {
    specifications.weight = parseFloat(formData.weight)
    specifications.weightUnit = formData.weightUnit
  }

  if (formData.usageValue) {
    const usageNum = parseInt(formData.usageValue)
    specifications.usageUnit = formData.usageUnit

    if (formData.usageUnit === "hours") {
      specifications.hoursUsed = usageNum
    } else if (formData.usageUnit === "km") {
      specifications.kilometersUsed = usageNum
    } else if (formData.usageUnit === "tons") {
      specifications.tonnageUsed = usageNum
    }
  }

  return specifications
}

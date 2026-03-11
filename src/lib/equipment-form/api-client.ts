import type { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import type { FormData, UploadedImage } from "./validation"
import { buildPricingFromForm, getChangedPricing } from "./pricing"
import { buildSpecificationsFromForm } from "./specifications"

export async function loadEquipment(equipmentId: string): Promise<{
  success: boolean
  data?: EquipmentWithSupplier
}> {
  try {
    const response = await fetch(`/api/equipment/${equipmentId}?admin=true`)
    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error loading equipment:", error)
    return { success: false }
  }
}

export async function submitEquipment(
  formData: FormData,
  images: UploadedImage[],
  equipmentId?: string,
  existingEquipment?: EquipmentWithSupplier,
): Promise<{ success: boolean; error?: string; errorCode?: string }> {
  const pricing = buildPricingFromForm(formData)
  const specifications = buildSpecificationsFromForm(formData)

  const equipmentData: any = {
    description: formData.description.trim(),
    categoryId: formData.category,
    equipmentTypeId: formData.type,
    location: formData.location,
    images: images.map((img) => img.url),
    specifications,
    listingType: formData.listingType,
  }

  if (equipmentId && existingEquipment) {
    const changedPricing = getChangedPricing(existingEquipment.pricing, pricing)
    if (changedPricing) {
      equipmentData.pricing = changedPricing
    }
  } else {
    equipmentData.pricing = pricing
  }

  const url = equipmentId ? `/api/equipment/${equipmentId}` : "/api/equipment"
  const method = equipmentId ? "PUT" : "POST"

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipmentData),
  })

  const result = await response.json()

  if (!response.ok) {
    return {
      success: false,
      error: result.error,
      errorCode: result.errorCode,
    }
  }

  return { success: true }
}

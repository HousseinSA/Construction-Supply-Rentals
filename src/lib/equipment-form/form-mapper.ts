import type { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import type { FormData, UploadedImage } from "./validation"
import { toStringOrEmpty, mapPricingToForm, mapSpecificationsToForm } from "./form-utils"

export function equipmentToFormData(equipment: EquipmentWithSupplier): FormData {
  const usageValue = toStringOrEmpty(
    equipment.specifications?.hoursUsed ||
    equipment.specifications?.kilometersUsed ||
    equipment.specifications?.tonnageUsed
  )

  return {
    category: equipment.categoryId as string,
    type: equipment.equipmentTypeId as string,
    location: equipment.location,
    listingType: equipment.listingType,
    description: equipment.description || "",
    usageValue,
    ...mapPricingToForm(equipment.pricing),
    ...mapSpecificationsToForm(equipment.specifications),
  }
}

export function imagesToUploadedImages(images: string[]): UploadedImage[] {
  return images.map((url: string) => {
    const match = url.match(/\/([^\/]+)\.[^.]+$/)
    const public_id = match ? `equipment/${match[1]}` : ""
    return { url, public_id }
  })
}

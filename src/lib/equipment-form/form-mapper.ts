import type { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import type { FormData, UploadedImage } from "./validation"

export function equipmentToFormData(equipment: EquipmentWithSupplier): FormData {
  const usageValue = equipment.specifications?.hoursUsed
    ? String(equipment.specifications.hoursUsed)
    : equipment.specifications?.kilometersUsed
      ? String(equipment.specifications.kilometersUsed)
      : equipment.specifications?.tonnageUsed
        ? String(equipment.specifications.tonnageUsed)
        : ""

  return {
    category: equipment.categoryId as string,
    type: equipment.equipmentTypeId as string,
    location: equipment.location,
    listingType: equipment.listingType,
    hourlyRate: equipment.pricing.hourlyRate ? String(equipment.pricing.hourlyRate) : "",
    dailyRate: equipment.pricing.dailyRate ? String(equipment.pricing.dailyRate) : "",
    monthlyRate: equipment.pricing.monthlyRate ? String(equipment.pricing.monthlyRate) : "",
    kmRate: equipment.pricing.kmRate ? String(equipment.pricing.kmRate) : "",
    tonRate: equipment.pricing.tonRate ? String(equipment.pricing.tonRate) : "",
    salePrice: equipment.pricing.salePrice ? String(equipment.pricing.salePrice) : "",
    description: equipment.description || "",
    brand: equipment.specifications?.brand || "",
    model: equipment.specifications?.model || "",
    year: equipment.specifications?.year ? String(equipment.specifications.year) : "",
    condition: equipment.specifications?.condition || "",
    usageValue,
    usageUnit: equipment.specifications?.usageUnit || "hours",
    weight: equipment.specifications?.weight ? String(equipment.specifications.weight) : "",
    weightUnit: equipment.specifications?.weightUnit || "kg",
  }
}

export function imagesToUploadedImages(images: string[]): UploadedImage[] {
  return images.map((url: string) => {
    const match = url.match(/\/([^\/]+)\.[^.]+$/)
    const public_id = match ? `equipment/${match[1]}` : ""
    return { url, public_id }
  })
}

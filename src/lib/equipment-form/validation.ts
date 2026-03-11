import { toast } from "sonner"

export interface FormData {
  category: string
  type: string
  location: string
  listingType: "forSale" | "forRent"
  hourlyRate: string
  dailyRate: string
  monthlyRate: string
  kmRate: string
  tonRate: string
  salePrice: string
  description: string
  brand: string
  model: string
  year: string
  condition: string
  usageValue: string
  usageUnit: string
  weight: string
  weightUnit: string
}

export interface UploadedImage {
  url: string
  public_id: string
}

export function validateEquipmentForm(
  formData: FormData,
  images: UploadedImage[],
  t: (key: string) => string,
): boolean {
  if (!formData.category) {
    toast.error(t("categoryRequired"))
    return false
  }
  if (!formData.type) {
    toast.error(t("equipmentTypeRequired"))
    return false
  }
  if (!formData.location) {
    toast.error(t("locationRequired"))
    return false
  }
  if (!formData.brand.trim()) {
    toast.error(t("brandRequired"))
    return false
  }
  if (formData.listingType === "forSale") {
    if (!formData.salePrice || parseFloat(formData.salePrice) <= 0) {
      toast.error(t("priceRequired"))
      return false
    }
    if (!formData.condition) {
      toast.error(t("conditionRequired"))
      return false
    }
  } else {
    const hasAnyPrice =
      formData.hourlyRate ||
      formData.dailyRate ||
      formData.kmRate ||
      formData.tonRate
    if (!hasAnyPrice) {
      toast.error(t("priceRequired"))
      return false
    }
  }
  if (images.length === 0) {
    toast.error(t("imagesRequired"))
    return false
  }
  return true
}

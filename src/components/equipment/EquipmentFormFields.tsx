import { useTranslations } from "next-intl"
import { UploadedImage } from "@/src/hooks/equipment/useEquipmentForm"
import { usePricingTypes } from "@/src/hooks/usePricingTypes"
import BasicInfoFields from "./form-fields/BasicInfoFields"
import SpecificationFields from "./form-fields/SpecificationFields"
import PricingFields from "./form-fields/PricingFields"
import DescriptionField from "./form-fields/DescriptionField"
import ImageUploadField from "./form-fields/ImageUploadField"

interface EquipmentFormFieldsProps {
  formData: {
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
  images: UploadedImage[]
  isSubmitting: boolean
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  onCategoryChange: (value: string) => void
  onTypeChange: (value: string) => void
  onLocationChange: (value: string) => void
  onConditionChange: (value: string) => void
  onWeightUnitChange: (value: string) => void
  onUsageUnitChange: (value: string) => void
  onImagesChange: (images: UploadedImage[]) => void
  onNumericInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isAdmin?: boolean
  isEditMode?: boolean
}

export default function EquipmentFormFields({
  formData,
  images,
  isSubmitting,
  onInputChange,
  onCategoryChange,
  onTypeChange,
  onLocationChange,
  onConditionChange,
  onWeightUnitChange,
  onUsageUnitChange,
  onImagesChange,
  onNumericInputChange,
  isAdmin = true,
  isEditMode = false,
}: EquipmentFormFieldsProps) {
  const t = useTranslations("dashboard.equipment")
  const { pricingTypes } = usePricingTypes(formData.type)
  const shouldLockFields = isEditMode && !isAdmin

  return (
    <>
      <BasicInfoFields
        formData={formData}
        onCategoryChange={onCategoryChange}
        onTypeChange={onTypeChange}
        onInputChange={onInputChange}
        onConditionChange={onConditionChange}
        shouldLockFields={shouldLockFields}
        isEditMode={isEditMode}
        isAdmin={isAdmin}
      />
      <SpecificationFields
        formData={formData}
        onInputChange={onInputChange}
        onUsageUnitChange={onUsageUnitChange}
        onWeightUnitChange={onWeightUnitChange}
        onLocationChange={onLocationChange}
        shouldLockFields={shouldLockFields}
        isSubmitting={isSubmitting}
      />

      <PricingFields
        formData={formData}
        pricingTypes={pricingTypes}
        onNumericInputChange={onNumericInputChange}
      />

      <DescriptionField value={formData.description} onChange={onInputChange} />

      <ImageUploadField
        images={images}
        onImagesChange={onImagesChange}
        disabled={isSubmitting}
      />
    </>
  )
}

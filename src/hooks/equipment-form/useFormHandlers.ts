import type { FormData } from "@/src/lib/equipment-form"

export function useFormHandlers(
  formData: FormData,
  setFormData: (data: FormData) => void,
) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "")
    setFormData({ ...formData, [e.target.name]: val })
  }

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value, type: "" })
  }

  const handleTypeChange = (value: string) => {
    setFormData({ ...formData, type: value })
  }

  const handleLocationChange = (value: string) => {
    setFormData({ ...formData, location: value })
  }

  const handleListingTypeChange = (listingType: "forSale" | "forRent") => {
    setFormData({ ...formData, listingType })
  }

  const handleConditionChange = (value: string) => {
    setFormData({ ...formData, condition: value })
  }

  const handleWeightUnitChange = (value: string) => {
    setFormData({ ...formData, weightUnit: value })
  }

  const handleUsageUnitChange = (value: string) => {
    setFormData({ ...formData, usageUnit: value })
  }

  return {
    handleInputChange,
    handleNumericInputChange,
    handleCategoryChange,
    handleTypeChange,
    handleLocationChange,
    handleListingTypeChange,
    handleConditionChange,
    handleWeightUnitChange,
    handleUsageUnitChange,
  }
}

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import Input from "../ui/Input"
import InputWithUnitSelect from "../ui/InputWithUnitSelect"
import CategoryDropdown from "../ui/CategoryDropdown"
import EquipmentTypeDropdown from "../ui/EquipmentTypeDropdown"
import CityDropdown from "../ui/CityDropdown"
import ConditionDropdown from "../ui/ConditionDropdown"
import UsageInput from "../ui/UsageInput"
import ImageUpload from "../ui/ImageUpload"
import YearPicker from "../ui/YearPicker"
import { UploadedImage } from "@/src/hooks/useEquipmentForm"

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
  equipmentCreatedBy?: "admin" | "supplier"
  hasPendingPricing?: boolean
  isEditMode?: boolean
  hasActiveBookings?: boolean
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
  hasActiveBookings = false,
}: EquipmentFormFieldsProps) {
  const t = useTranslations("dashboard.equipment")
  const [pricingTypes, setPricingTypes] = useState<string[]>([])
  
  const shouldLockFields = isEditMode && !isAdmin

  useEffect(() => {
    if (formData.type) {
      fetch(`/api/equipment-types/${formData.type}`)
        .then((res) => res.json())
        .then((data) => setPricingTypes(data.data?.pricingTypes || []))
    }
  }, [formData.type])

  return (
    <>
      {isAdmin && hasActiveBookings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">{t("activeBookingWarning")}</h4>
              <p className="text-sm text-yellow-800">{t("activeBookingWarningMessage")}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryDropdown
          value={formData.category}
          onChange={onCategoryChange}
          disabled={shouldLockFields}
        />

        <EquipmentTypeDropdown
          category={formData.category}
          value={formData.type}
          onChange={onTypeChange}
          disabled={isEditMode && !isAdmin}
        />

        <Input
          label={t("brand")}
          name="brand"
          value={formData.brand}
          onChange={onInputChange}
          placeholder={t("brandPlaceholder")}
          required
        />

        <Input
          label={t("model")}
          name="model"
          value={formData.model}
          onChange={onInputChange}
          placeholder={t("modelPlaceholder")}
        />

        <YearPicker
          label={t("year")}
          value={formData.year}
          onChange={(year) => {
            const event = {
              target: { name: "year", value: year },
            } as React.ChangeEvent<HTMLInputElement>
            onInputChange(event)
          }}
          placeholder={t("yearPlaceholder")}
        />

        <ConditionDropdown
          value={formData.condition}
          onChange={onConditionChange}
          required={formData.listingType === "forSale"}
        />

        {!(
          formData.listingType === "forSale" && formData.condition === "new"
        ) && (
          <UsageInput
            equipmentTypeId={formData.type}
            value={formData.usageValue}
            unitValue={formData.usageUnit}
            onValueChange={onInputChange}
            onUnitChange={onUsageUnitChange}
            disabled={isSubmitting}
          />
        )}
        <InputWithUnitSelect
          label={t("weight")}
          name="weight"
          value={formData.weight}
          unitValue={formData.weightUnit}
          onValueChange={onInputChange}
          onUnitChange={onWeightUnitChange}
          placeholder={t("weightPlaceholder")}
        />
        <CityDropdown 
          value={formData.location} 
          onChange={onLocationChange} 
          disabled={shouldLockFields} 
        />
      </div>

      {formData.listingType === "forSale" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label={t("salePrice")}
            name="salePrice"
            type="text"
            value={formData.salePrice}
            onChange={onNumericInputChange}
            placeholder="50000"
            required
            disabled={false}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(pricingTypes.includes("hourly") || pricingTypes.length === 0) && (
            <Input
              label={t("hourlyRate")}
              name="hourlyRate"
              type="text"
              value={formData.hourlyRate}
              onChange={onNumericInputChange}
              placeholder="500"
              disabled={false}
            />
          )}
          {(pricingTypes.includes("daily") || pricingTypes.length === 0) && (
            <Input
              label={t("dailyRate")}
              name="dailyRate"
              type="text"
              value={formData.dailyRate}
              onChange={onNumericInputChange}
              placeholder="5000"
              disabled={false}
            />
          )}
          {pricingTypes.includes("per_km") && (
            <Input
              label={t("kmRate")}
              name="kmRate"
              type="text"
              value={formData.kmRate}
              onChange={onNumericInputChange}
              placeholder="50"
              disabled={false}
            />
          )}
          {pricingTypes.includes("per_ton") && (
            <Input
              label={t("tonRate")}
              name="tonRate"
              type="text"
              value={formData.tonRate}
              onChange={onNumericInputChange}
              placeholder="100"
              disabled={false}
            />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("description")}
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("images")} <span className="text-red-500">*</span>
          <span className="text-sm text-gray-500 ml-2">
            {t("imageConstraints")}
          </span>
        </label>
        <ImageUpload
          images={images}
          onImagesChange={onImagesChange}
          maxImages={10}
          disabled={isSubmitting}
        />
      </div>
    </>
  )
}

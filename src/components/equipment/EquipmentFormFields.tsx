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
}: EquipmentFormFieldsProps) {
  const t = useTranslations("dashboard.equipment")
  const [pricingTypes, setPricingTypes] = useState<string[]>([])

  useEffect(() => {
    if (formData.type) {
      fetch(`/api/equipment-types/${formData.type}`)
        .then((res) => res.json())
        .then((data) => setPricingTypes(data.data?.pricingTypes || []))
    }
  }, [formData.type])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryDropdown
          value={formData.category}
          onChange={onCategoryChange}
        />

        <EquipmentTypeDropdown
          category={formData.category}
          value={formData.type}
          onChange={onTypeChange}
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

        {formData.listingType === "forSale" && (
          <ConditionDropdown
            value={formData.condition}
            onChange={onConditionChange}
          />
        )}

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
        <CityDropdown value={formData.location} onChange={onLocationChange} />
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
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pricingTypes.includes("hourly") && (
            <Input
              label={t("hourlyRate")}
              name="hourlyRate"
              type="text"
              value={formData.hourlyRate}
              onChange={onNumericInputChange}
              placeholder="500"
            />
          )}
          {pricingTypes.includes("daily") && (
            <Input
              label={t("dailyRate")}
              name="dailyRate"
              type="text"
              value={formData.dailyRate}
              onChange={onNumericInputChange}
              placeholder="5000"
            />
          )}
          {pricingTypes.includes("monthly") && formData.dailyRate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("monthlyRate")}
              </label>
              <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                {(parseFloat(formData.dailyRate) * 30).toLocaleString()} MRU
                <span className="text-xs text-gray-500 ml-2">({t("autoCalculated")})</span>
              </div>
            </div>
          )}
          {pricingTypes.includes("per_km") && (
            <Input
              label={t("kmRate")}
              name="kmRate"
              type="text"
              value={formData.kmRate}
              onChange={onNumericInputChange}
              placeholder="50"
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
          maxImages={5}
          disabled={isSubmitting}
        />
      </div>
    </>
  )
}

import { useTranslations } from "next-intl"
import Input from "../ui/Input"
import InputWithUnitSelect from "../ui/InputWithUnitSelect"
import CategoryDropdown from "../ui/CategoryDropdown"
import EquipmentTypeDropdown from "../ui/EquipmentTypeDropdown"
import CityDropdown from "../ui/CityDropdown"
import PricingTypeDropdown from "../ui/PricingTypeDropdown"

import ImageUpload from "../ui/ImageUpload"
import { UploadedImage } from "@/src/hooks/useEquipmentForm"

interface EquipmentFormFieldsProps {
  formData: {
    category: string
    type: string
    location: string
    listingType: "forSale" | "forRent"
    priceType: string
    price: string
    description: string
    brand: string
    model: string
    hoursUsed: string
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
  onPriceTypeChange: (value: string) => void
  onWeightUnitChange: (value: string) => void
  onImagesChange: (images: UploadedImage[]) => void
}

export default function EquipmentFormFields({
  formData,
  images,
  isSubmitting,
  onInputChange,
  onCategoryChange,
  onTypeChange,
  onLocationChange,
  onPriceTypeChange,
  onWeightUnitChange,
  onImagesChange,
}: EquipmentFormFieldsProps) {
  const t = useTranslations("dashboard.equipment")

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

        {formData.listingType === "forRent" && formData.type && (
          <PricingTypeDropdown
            equipmentType={formData.type}
            value={formData.priceType}
            onChange={onPriceTypeChange}
          />
        )}

        <Input
          label={t("price")}
          name="price"
          type="number"
          value={formData.price}
          onChange={onInputChange}
          placeholder="5000"
          required
        />
      </div>



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

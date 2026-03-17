import { useTranslations } from "next-intl"
import CategoryDropdown from "../../ui/CategoryDropdown"
import EquipmentTypeDropdown from "../../ui/EquipmentTypeDropdown"
import Input from "../../ui/Input"
import YearPicker from "../../ui/YearPicker"
import ConditionDropdown from "../../ui/ConditionDropdown"

interface BasicInfoFieldsProps {
  formData: {
    category: string
    type: string
    brand: string
    model: string
    year: string
    condition: string
    listingType: "forSale" | "forRent"
  }
  onCategoryChange: (value: string) => void
  onTypeChange: (value: string) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onConditionChange: (value: string) => void
  shouldLockFields: boolean
  isEditMode: boolean
  isAdmin: boolean
}

export default function BasicInfoFields({
  formData,
  onCategoryChange,
  onTypeChange,
  onInputChange,
  onConditionChange,
  shouldLockFields,
  isEditMode,
  isAdmin,
}: BasicInfoFieldsProps) {
  const t = useTranslations("dashboard.equipment")

  return (
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
        onChange={(yearValue) => {
          const event = {
            target: { name: "year", value: yearValue },
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
    </div>
  )
}

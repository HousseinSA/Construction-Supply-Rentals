import { useTranslations } from "next-intl"
import CategoryDropdown from "../../ui/CategoryDropdown"
import EquipmentTypeDropdown from "../../ui/EquipmentTypeDropdown"
import Input from "../../ui/Input"
import YearPicker from "../../ui/YearPicker"
import ConditionDropdown from "../../ui/ConditionDropdown"

interface BasicInfoFieldsProps {
  category: string
  type: string
  brand: string
  model: string
  year: string
  condition: string
  listingType: "forSale" | "forRent"
  onCategoryChange: (value: string) => void
  onTypeChange: (value: string) => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onConditionChange: (value: string) => void
  shouldLockFields: boolean
  isEditMode: boolean
  isAdmin: boolean
}

export default function BasicInfoFields({
  category,
  type,
  brand,
  model,
  year,
  condition,
  listingType,
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
        value={category}
        onChange={onCategoryChange}
        disabled={shouldLockFields}
      />

      <EquipmentTypeDropdown
        category={category}
        value={type}
        onChange={onTypeChange}
        disabled={isEditMode && !isAdmin}
      />

      <Input
        label={t("brand")}
        name="brand"
        value={brand}
        onChange={onInputChange}
        placeholder={t("brandPlaceholder")}
        required
      />

      <Input
        label={t("model")}
        name="model"
        value={model}
        onChange={onInputChange}
        placeholder={t("modelPlaceholder")}
      />

      <YearPicker
        label={t("year")}
        value={year}
        onChange={(yearValue) => {
          const event = {
            target: { name: "year", value: yearValue },
          } as React.ChangeEvent<HTMLInputElement>
          onInputChange(event)
        }}
        placeholder={t("yearPlaceholder")}
      />

      <ConditionDropdown
        value={condition}
        onChange={onConditionChange}
        required={listingType === "forSale"}
      />
    </div>
  )
}

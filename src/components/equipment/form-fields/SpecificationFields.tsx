import { useTranslations } from "next-intl"
import UsageInput from "../../ui/UsageInput"
import InputWithUnitSelect from "../../ui/InputWithUnitSelect"
import CityDropdown from "../../ui/CityDropdown"

interface SpecificationFieldsProps {
  formData: {
    type: string
    usageValue: string
    usageUnit: string
    weight: string
    weightUnit: string
    location: string
    listingType: "forSale" | "forRent"
    condition: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUsageUnitChange: (value: string) => void
  onWeightUnitChange: (value: string) => void
  onLocationChange: (value: string) => void
  shouldLockFields: boolean
  isSubmitting: boolean
}

export default function SpecificationFields({
  formData,
  onInputChange,
  onUsageUnitChange,
  onWeightUnitChange,
  onLocationChange,
  shouldLockFields,
  isSubmitting,
}: SpecificationFieldsProps) {
  const t = useTranslations("dashboard.equipment")
  const showUsage = !(formData.listingType === "forSale" && formData.condition === "new")

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {showUsage && (
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
  )
}

import { useTranslations } from "next-intl"
import CustomCheckbox from "../ui/CustomCheckbox"

interface ListingTypeSelectorProps {
  value: "forSale" | "forRent"
  onChange: (value: "forSale" | "forRent") => void
  disabled?: boolean
}

export default function ListingTypeSelector({
  value,
  onChange,
  disabled = false,
}: ListingTypeSelectorProps) {
  const t = useTranslations("dashboard.equipment")

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">
        {t("listingType")}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomCheckbox
          checked={value === "forRent"}
          onChange={() => onChange("forRent")}
          label={t("forRent")}
          disabled={disabled}
          variant="card"
        />
        <CustomCheckbox
          checked={value === "forSale"}
          onChange={() => onChange("forSale")}
          label={t("forSale")}
          disabled={disabled}
          variant="card"
        />
      </div>
    </div>
  )
}

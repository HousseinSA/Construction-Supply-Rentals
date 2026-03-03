import { useTranslations } from "next-intl"
import Input from "../../ui/Input"

interface PricingFieldsProps {
  listingType: "forSale" | "forRent"
  salePrice: string
  hourlyRate: string
  dailyRate: string
  monthlyRate: string
  kmRate: string
  tonRate: string
  pricingTypes: string[]
  onNumericInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const RENTAL_PRICING_CONFIG = [
  { key: "hourlyRate", label: "hourlyRate", placeholder: "500", type: "hourly" },
  { key: "dailyRate", label: "dailyRate", placeholder: "5000", type: "daily" },
  { key: "monthlyRate", label: "monthlyRate", placeholder: "120000", type: "daily" },
  { key: "kmRate", label: "kmRate", placeholder: "500", type: "per_km" },
  { key: "tonRate", label: "tonRate", placeholder: "100", type: "per_ton" },
] as const

export default function PricingFields({
  listingType,
  salePrice,
  hourlyRate,
  dailyRate,
  monthlyRate,
  kmRate,
  tonRate,
  pricingTypes,
  onNumericInputChange,
}: PricingFieldsProps) {
  const t = useTranslations("dashboard.equipment")

  const priceValues: Record<string, string> = {
    hourlyRate,
    dailyRate,
    monthlyRate,
    kmRate,
    tonRate,
  }

  if (listingType === "forSale") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label={t("salePrice")}
          name="salePrice"
          type="text"
          value={salePrice}
          onChange={onNumericInputChange}
          placeholder="50000"
          required
          disabled={false}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {RENTAL_PRICING_CONFIG.map(({ key, label, placeholder, type }) => {
        const shouldShow = pricingTypes.includes(type) || pricingTypes.length === 0
        if (!shouldShow) return null

        return (
          <Input
            key={key}
            label={t(label)}
            name={key}
            type="text"
            value={priceValues[key]}
            onChange={onNumericInputChange}
            placeholder={placeholder}
            disabled={false}
          />
        )
      })}
    </div>
  )
}

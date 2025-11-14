import { useTranslations } from "next-intl"

interface ListingTypeSelectorProps {
  value: "forSale" | "forRent"
  onChange: (value: "forSale" | "forRent") => void
}

export default function ListingTypeSelector({
  value,
  onChange,
}: ListingTypeSelectorProps) {
  const t = useTranslations("dashboard.equipment")

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-4">
        {t("listingType")}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("forRent")}
          className={`p-4 border-2 rounded-xl transition-all duration-200 ${
            value === "forRent"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                value === "forRent" ? "border-primary" : "border-gray-300"
              }`}
            >
              {value === "forRent" && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{t("forRent")}</h3>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onChange("forSale")}
          className={`p-4 border-2 rounded-xl transition-all duration-200 ${
            value === "forSale"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                value === "forSale" ? "border-primary" : "border-gray-300"
              }`}
            >
              {value === "forSale" && (
                <div className="w-3 h-3 rounded-full bg-primary" />
              )}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">{t("forSale")}</h3>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}

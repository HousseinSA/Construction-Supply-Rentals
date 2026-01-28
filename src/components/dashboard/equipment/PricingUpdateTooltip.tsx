import { useTranslations, useLocale } from "next-intl"
import { Equipment } from "@/src/lib/models/equipment"

interface PricingUpdateTooltipProps {
  item: Equipment
  isSupplier: boolean
}

export default function PricingUpdateTooltip({ item, isSupplier }: PricingUpdateTooltipProps) {
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const isRTL = locale === "ar"

  if (!isSupplier) {
    return <>{t("clickToShowNewPrices")}</>
  }

  return (
    <div className="space-y-1">
      <div className="font-semibold">{t("pricingPendingApproval")}</div>
      <div className="text-gray-300">
        {isRTL 
          ? `${t("requestedPricing")} → ${t("currentPricing")}`
          : `${t("currentPricing")} → ${t("requestedPricing")}`
        }
      </div>
      {[
        { key: "hourlyRate" as const, suffix: `/h` },
        { key: "dailyRate" as const, suffix: `/${tCommon("day")}` },
        { key: "kmRate" as const, suffix: `/${tCommon("km")}` },
        { key: "salePrice" as const, suffix: "" },
      ].map(({ key, suffix }) =>
        item.pendingPricing?.[key] && item.pricing[key] !== item.pendingPricing[key] ? (
          <div key={key} dir="ltr">
            {item.pricing[key]} MRU{suffix} → {item.pendingPricing[key]} MRU{suffix}
          </div>
        ) : null
      )}
    </div>
  )
}

import { useTranslations, useLocale } from "next-intl"
import { Equipment } from "@/src/lib/models/equipment"

interface PricingUpdateTooltipProps {
  item: Equipment
  isSupplier: boolean
}

export default function PricingUpdateTooltip({
  item,
  isSupplier,
}: PricingUpdateTooltipProps) {
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const isRTL = locale === "ar"

  if (!isSupplier) {
    return <>{t("clickToShowNewPrices")}</>
  }

  const priceTypes = [
    { key: "hourlyRate" as const, suffix: `/${tCommon("hour")}` },
    { key: "dailyRate" as const, suffix: `/${tCommon("day")}` },
    { key: "monthlyRate" as const, suffix: `/${tCommon("month")}` },
    { key: "kmRate" as const, suffix: `/${tCommon("km")}` },
    { key: "salePrice" as const, suffix: "" },
  ]

  const hasAnyUpdate = priceTypes.some(({ key }) => {
    const currentPrice = item.pricing[key]
    const pendingPrice = item.pendingPricing?.[key]
    return pendingPrice && currentPrice && currentPrice !== pendingPrice
  })

  return (
    <div className="space-y-1">
      {item.pendingPricing && (
        <>
          <div className="font-semibold text-gray-900">
            {t("pricingPendingApproval")}
          </div>
          {hasAnyUpdate && (
            <div className="text-gray-600">
              {isRTL
                ? `${t("currentPricing")} ← ${t("requestedPricing")}`
                : `${t("currentPricing")} → ${t("requestedPricing")}`}
            </div>
          )}
          {priceTypes.map(({ key, suffix }) => {
            const currentPrice = item.pricing[key]
            const pendingPrice = item.pendingPricing?.[key]
            if (!pendingPrice || currentPrice === pendingPrice) return null
            if (!currentPrice) {
              return (
                <div key={key} dir="ltr" className="text-gray-700">
                  {pendingPrice} MRU{suffix}
                </div>
              )
            }

            const arrow = isRTL ? "←" : "→"
            return (
              <div key={key} className="text-gray-600">
                <span dir="ltr">
                  {currentPrice} MRU{suffix}
                </span>{" "}
                {arrow}{" "}
                <span className="text-orange-600 font-medium" dir="ltr">
                  {pendingPrice} MRU{suffix}
                </span>
              </div>
            )
          })}
        </>
      )}
      {item.rejectedPricingValues &&
        Object.keys(item.rejectedPricingValues).length > 0 &&
        (() => {
          const activeRejections = item.pendingPricing
            ? Object.fromEntries(
                Object.entries(item.rejectedPricingValues).filter(
                  ([key]) => !item.pendingPricing!.hasOwnProperty(key),
                ),
              )
            : item.rejectedPricingValues

          if (Object.keys(activeRejections).length === 0) return null
          return (
            <div
              className={
                item.pendingPricing ? "border-t border-gray-300 pt-2 mt-2" : ""
              }
            >
              <div>
                <div className="font-semibold mb-1 text-gray-900">
                  {item.pricingRejectionReasons
                    ? t("previousRejection")
                    : t("rejectedPrice")}
                  :
                </div>
                {item.pricingRejectionReasons?._all ? (
                  <>
                    {item.pricingRejectionReasons._all.trim() && (
                      <div className="text-gray-600 mb-1">
                        {item.pricingRejectionReasons._all}
                      </div>
                    )}
                    {Object.entries(activeRejections).map(([key, value]) => {
                      const priceType = priceTypes.find((p) => p.key === key)
                      const currentPrice =
                        item.pricing[key as keyof typeof item.pricing]
                      return (
                        <div key={key} className="text-gray-600">
                          <span className="text-red-600 font-medium" dir="ltr">
                            {value} MRU{priceType?.suffix || ""}
                          </span>
                          {currentPrice && (
                            <span className="text-red-600"> ✗ </span>
                          )}
                          {currentPrice && (
                            <span className="text-gray-600" dir="ltr">
                              {currentPrice} MRU{priceType?.suffix || ""}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </>
                ) : item.pricingRejectionReasons ? (
                  Object.entries(item.pricingRejectionReasons).map(
                    ([key, reason]) => {
                      const price =
                        activeRejections?.[
                          key as keyof typeof item.rejectedPricingValues
                        ]
                      if (!price) return null
                      const priceType = priceTypes.find((p) => p.key === key)
                      const currentPrice =
                        item.pricing[key as keyof typeof item.pricing]
                      return (
                        <div key={key} className="text-gray-600">
                          <span className="text-red-600 font-medium" dir="ltr">
                            {price} MRU{priceType?.suffix || ""}
                          </span>
                          {currentPrice && (
                            <span className="text-red-600"> ✗ </span>
                          )}
                          {currentPrice && (
                            <span className="text-gray-600" dir="ltr">
                              {currentPrice} MRU{priceType?.suffix || ""}
                            </span>
                          )}
                          {reason && reason.trim() && (
                            <span className="text-gray-600"> - {reason}</span>
                          )}
                        </div>
                      )
                    },
                  )
                ) : (
                  Object.entries(activeRejections).map(([key, value]) => {
                    const priceType = priceTypes.find((p) => p.key === key)
                    const currentPrice =
                      item.pricing[key as keyof typeof item.pricing]
                    return (
                      <div key={key} className="text-gray-600">
                        <span className="text-red-600 font-medium" dir="ltr">
                          {value} MRU{priceType?.suffix || ""}
                        </span>
                        {currentPrice && (
                          <span className="text-red-600"> ✗ </span>
                        )}
                        {currentPrice && (
                          <span className="text-gray-600" dir="ltr">
                            {currentPrice} MRU{priceType?.suffix || ""}
                          </span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })()}
    </div>
  )
}

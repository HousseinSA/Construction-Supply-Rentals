import { XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Equipment } from "@/src/lib/models/equipment"
import RejectedPriceRow from "./RejectedPriceRow"
import { getPriceSuffix } from "./priceHelpers"

interface PricingRejectionBannerProps {
  pricingRejectionReasons?: Equipment["pricingRejectionReasons"]
  rejectedPricingValues?: Equipment["rejectedPricingValues"]
  currentPricing: Equipment["pricing"]
  listingType: "forSale" | "forRent"
  pendingPricing?: Equipment["pendingPricing"]
  onDismiss?: () => void
}

export default function PricingRejectionBanner({
  pricingRejectionReasons,
  rejectedPricingValues,
  currentPricing,
  pendingPricing,
  onDismiss,
}: PricingRejectionBannerProps) {
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")

  if (!rejectedPricingValues || Object.keys(rejectedPricingValues).length === 0)
    return null

  const activeRejections = pendingPricing
    ? Object.fromEntries(
        Object.entries(rejectedPricingValues).filter(
          ([key]) => !pendingPricing.hasOwnProperty(key),
        ),
      )
    : rejectedPricingValues

  if (Object.keys(activeRejections).length === 0) return null

  const formatPrice = (value: number) => `${value} MRU`

  const priceTypes = [
    { key: "hourlyRate" as const },
    { key: "dailyRate" as const },
    { key: "monthlyRate" as const },
    { key: "kmRate" as const },
    { key: "tonRate" as const },
    { key: "salePrice" as const },
  ]

  const hasAnyReason =
    (pricingRejectionReasons?._all && pricingRejectionReasons._all.trim()) ||
    (pricingRejectionReasons &&
      Object.entries(pricingRejectionReasons)
        .filter(([key]) => key !== "_all")
        .some(([, reason]) => typeof reason === "string" && reason.trim()))

  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-700 mb-2">
            {hasAnyReason
              ? t("pricingUpdateRejectedMessage")
              : t("pricingUpdateRejected")}
          </p>
          {pricingRejectionReasons?._all ? (
            <>
              {pricingRejectionReasons._all.trim() && (
                <p className="text-sm text-red-600 mb-2">
                  {pricingRejectionReasons._all}
                </p>
              )}
              <div className="space-y-1">
                {activeRejections &&
                  Object.entries(activeRejections).map(([key, value]) => {
                    const priceType = priceTypes.find((p) => p.key === key)
                    const currentPrice = currentPricing[key as keyof typeof currentPricing]
                    return (
                      <RejectedPriceRow
                        key={key}
                        rejectedValue={value}
                        currentValue={typeof currentPrice === "number" ? currentPrice : undefined}
                        suffix={priceType ? getPriceSuffix(priceType.key, tCommon) : ""}
                      />
                    )
                  })}
              </div>
            </>
          ) : pricingRejectionReasons ? (
            <div className="space-y-1">
              {Object.entries(pricingRejectionReasons).map(([key, reason]) => {
                const price = activeRejections?.[key as keyof typeof rejectedPricingValues]
                if (!price) return null
                const priceType = priceTypes.find((p) => p.key === key)
                const currentPrice = currentPricing[key as keyof typeof currentPricing]
                return (
                  <RejectedPriceRow
                    key={key}
                    rejectedValue={price}
                    currentValue={typeof currentPrice === "number" ? currentPrice : undefined}
                    suffix={priceType ? getPriceSuffix(priceType.key, tCommon) : ""}
                    reason={reason}
                  />
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {activeRejections &&
                Object.entries(activeRejections).map(([key, value]) => {
                  const priceType = priceTypes.find((p) => p.key === key)
                  const currentPrice = currentPricing[key as keyof typeof currentPricing]
                  return (
                    <RejectedPriceRow
                      key={key}
                      rejectedValue={value}
                      currentValue={typeof currentPrice === "number" ? currentPrice : undefined}
                      suffix={priceType ? getPriceSuffix(priceType.key, tCommon) : ""}
                    />
                  )
                })}
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

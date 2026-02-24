import { useTranslations, useLocale } from "next-intl"
import { Clock, ArrowRight, ArrowLeft } from "lucide-react"
import { buildPriceChanges } from "./priceHelpers"

interface PendingPricingBannerProps {
  currentPricing: any
  pendingPricing: any
  listingType: "forSale" | "forRent"
}

export default function PendingPricingBanner({
  currentPricing,
  pendingPricing,
  listingType,
}: PendingPricingBannerProps) {
  const t = useTranslations("dashboard.equipment")
  const locale = useLocale()
  const isRTL = locale === "ar"

  const formatPrice = (value: number) => `${value} MRU`

  const renderPriceComparison = () => {
    if (listingType === "forSale" && pendingPricing.salePrice !== currentPricing.salePrice) {
      const isNew = !currentPricing.salePrice || currentPricing.salePrice === 0
      return (
        <div className="flex items-center gap-3 text-sm" dir="ltr">
          {isNew ? (
            <>
              <span className="text-orange-600 font-medium">{t("new")}:</span>
              <span className="font-semibold text-orange-700">{formatPrice(pendingPricing.salePrice)}</span>
            </>
          ) : isRTL ? (
            <>
              <span className="font-semibold text-orange-700">{formatPrice(pendingPricing.salePrice)}</span>
              <ArrowLeft className="w-4 h-4 text-orange-500" />
              <span className="text-gray-600">{formatPrice(currentPricing.salePrice)}</span>
            </>
          ) : (
            <>
              <span className="text-gray-600">{formatPrice(currentPricing.salePrice)}</span>
              <ArrowRight className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-orange-700">{formatPrice(pendingPricing.salePrice)}</span>
            </>
          )}
        </div>
      )
    }

    const prices = buildPriceChanges(currentPricing, pendingPricing, t)

    return (
      <div className="space-y-2">
        {prices.map((price, idx) => (
          <div key={idx} className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 min-w-[100px]">{price.label}:</span>
            {price.isNew ? (
              <div className="flex items-center gap-2" dir="ltr">
                <span className="text-orange-600 font-medium">{t("new")}</span>
                <span className="font-semibold text-orange-700">{formatPrice(price.pending)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3" dir="ltr">
                {isRTL ? (
                  <>
                    <span className="font-semibold text-orange-700">{formatPrice(price.pending)}</span>
                    <ArrowLeft className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">{formatPrice(price.current)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">{formatPrice(price.current)}</span>
                    <ArrowRight className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-orange-700">{formatPrice(price.pending)}</span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-700 mb-3">
            {t("pricingPendingApproval")}
          </p>
          {renderPriceComparison()}
        </div>
      </div>
    </div>
  )
}
